import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import ServiceTemplate from '../models/ServiceTemplate.js';
import { nextBookingId } from "../utils/generateId.js";
import Review from "../models/Review.js";
import mongoose from 'mongoose';

// Customer creates booking request at location
export const createBooking = async (req, res) => {
  try {
    const { serviceId, lng, lat, scheduledAt } = req.body;
    if (!serviceId || typeof lng !== "number" || typeof lat !== "number")
      return res.status(400).json({ message: "serviceId, lng, lat required" });

  const service = await Service.findById(serviceId).populate('template');
    if (!service) return res.status(404).json({ message: "Service not found" });
  if (!service.template) return res.status(400).json({ message: 'Service not available (legacy/disabled)' });
  if (service.template && service.template.active === false) return res.status(400).json({ message: 'Service template inactive' });

    const bookingId = await nextBookingId();

    const booking = await Booking.create({
      bookingId,
      customer: req.userId,
      service: service._id,
      provider: service.provider || undefined, // assign owning provider so they can see it
  location: { type: "Point", coordinates: [lng, lat] },
  scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      status: "requested",
      paymentStatus: "pending"
    });

    res.json({ booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Multi-provider booking creation based on template (aggregated service selection)
const OFFER_TIMEOUT_MS = 10 * 1000; // 10 seconds

async function computeProviderExperience(providerId) {
  const user = await User.findById(providerId).select('completedJobs');
  return user?.completedJobs || 0;
}

export const createBookingMulti = async (req, res) => {
  try {
    const { templateId, lng, lat, scheduledAt } = req.body;
    if (!templateId || typeof lng !== 'number' || typeof lat !== 'number') {
      return res.status(400).json({ message: 'templateId, lng, lat required' });
    }
    const template = await ServiceTemplate.findById(templateId);
    if(!template) return res.status(404).json({ message: 'Template not found' });
    if(template.active === false) return res.status(400).json({ message: 'Template inactive' });

    // Find services offering this template and providers who are live
    const services = await Service.find({ template: template._id }).populate('provider','name rating ratingCount isAvailable');
    // Re-validate availability from Users collection (avoid stale populated doc cache)
    const liveServices = [];
    for(const s of services){
      if(!s.provider) continue;
      const fresh = await User.findById(s.provider._id).select('isAvailable rating ratingCount');
      if(fresh && fresh.isAvailable) {
        // sync fresh availability
        s.provider.isAvailable = true;
        liveServices.push(s);
      }
    }
    if(liveServices.length === 0) {
      return res.status(400).json({ message: 'No live providers available for this service right now' });
    }

    // Rank: rating desc then experience desc then createdAt asc (as tiebreak via provider _id)
    const ranked = [];
    for(const s of liveServices){
      const exp = await computeProviderExperience(s.provider._id);
      ranked.push({ service: s, provider: s.provider, rating: s.provider.rating || 0, experience: exp });
    }
    ranked.sort((a,b)=>{
      if(b.rating !== a.rating) return b.rating - a.rating;
      if(b.experience !== a.experience) return b.experience - a.experience;
      return a.provider._id.toString().localeCompare(b.provider._id.toString());
    });

    const bookingId = await nextBookingId();
    const now = new Date();
    const first = ranked[0];
    const queue = ranked.slice(1).map(r=>r.provider._id);

    const booking = await Booking.create({
      bookingId,
      customer: req.userId,
      service: first.service._id, // initial service (may change if next provider selected)
      provider: undefined, // not assigned until accepted
      serviceTemplate: template._id,
      location: { type: 'Point', coordinates: [lng, lat] },
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      status: 'requested',
      overallStatus: 'pending',
      paymentStatus: 'pending',
      pendingProviders: queue,
      offers: [{ provider: first.provider._id, status: 'pending', offeredAt: now }],
      providerResponseTimeout: new Date(now.getTime() + OFFER_TIMEOUT_MS),
      autoAssignMessage: 'Searching for best available provider...'
      ,pendingExpiresAt: new Date(now.getTime() + 5*60*1000) // 5 minute global visibility window
    });

    return res.json({ booking, message: 'Request sent. The best available provider will be assigned shortly.' });
  } catch(e){
    res.status(500).json({ message: e.message });
  }
};

async function advanceOffer(booking){
  try {
    if(!booking) return;
    if(!Array.isArray(booking.offers)) booking.offers = [];
    if(!Array.isArray(booking.pendingProviders)) booking.pendingProviders = [];
    // Keep pulling from queue until we find a provider who is still available
    while(booking.pendingProviders && booking.pendingProviders.length > 0){
      const nextProviderId = booking.pendingProviders.shift();
      if(!nextProviderId) continue;
      const prov = await User.findById(nextProviderId).select('isAvailable');
      if(prov && prov.isAvailable){
        booking.offers.push({ provider: nextProviderId, status: 'pending', offeredAt: new Date() });
        booking.providerResponseTimeout = new Date(Date.now() + OFFER_TIMEOUT_MS);
        await booking.save();
        return; // scheduled new offer
      }
      // else skip silently and continue
    }
    // Queue exhausted or no live providers
    booking.providerResponseTimeout = undefined;
    if(!booking.offers.find(o=>o.status==='pending')){
      booking.autoAssignMessage = 'No live providers currently available.';
    }
    await booking.save();
  } catch(err){
    console.error('[advanceOffer] error', err);
    throw err;
  }
}

async function expireIfNeeded(booking){
  if(!booking.offers || booking.offers.length === 0) return;
  const current = booking.offers.find(o=>o.status === 'pending');
  if(!current) return; // nothing pending
  if(booking.providerResponseTimeout && booking.providerResponseTimeout < new Date()){
    current.status = 'expired';
    current.respondedAt = new Date();
    await advanceOffer(booking);
  }
}

export const acceptOffer = async (req,res)=>{
  try {
    const { id } = req.params; // booking id
    const booking = await Booking.findById(id).populate('service');
    if(!booking) return res.status(404).json({ message: 'Not found' });
    if(booking.status !== 'requested') return res.status(400).json({ message: 'Cannot accept now' });
    await expireIfNeeded(booking);
    const pending = booking.offers.find(o=>o.status==='pending');
    if(!pending || pending.provider.toString() !== req.userId) return res.status(403).json({ message: 'No active offer for you' });
    // Assign
  pending.status = 'accepted'; // offer itself marked accepted
  pending.respondedAt = new Date();
  // Immediately move booking into in_progress (was previously 'accepted') so provider can mark complete
  booking.status = 'in_progress';
    booking.provider = pending.provider;
    booking.acceptedAt = new Date();
    booking.pendingProviders = [];
    booking.providerResponseTimeout = undefined;
    booking.autoAssignMessage = undefined;
    await booking.save();
    
    // ✅ AUTO-PAUSE GO LIVE: Turn off provider's availability during service
    await User.findByIdAndUpdate(req.userId, {
      isAvailable: false,
      isLiveTracking: false
    });
    
    res.json({ booking });
  } catch(e){ res.status(500).json({ message: e.message }); }
};

export const declineOffer = async (req,res)=>{
  try {
    console.log('[declineOffer] incoming', req.params.id, 'user', req.userId);
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking id', id });
    }
    const booking = await Booking.findById(id);
    if(!booking) return res.status(404).json({ message: 'Not found' });
    if(booking.status !== 'requested') return res.status(400).json({ message: 'Cannot decline now' });
    await expireIfNeeded(booking);
    if(!Array.isArray(booking.offers)) {
      console.error('[declineOffer] booking.offers not array', booking._id);
      return res.status(400).json({ message: 'No offers present' });
    }
    const pending = booking.offers.find(o=>o.status==='pending');
    if(!pending){
      console.warn('[declineOffer] no pending offer', booking._id, booking.offers.map(o=>({p:o.provider, s:o.status})));
      return res.status(403).json({ message: 'No active offer for you' });
    }
    if(!pending.provider){
      console.error('[declineOffer] pending offer missing provider', booking._id, pending);
      return res.status(400).json({ message: 'Offer corrupted (provider missing)' });
    }
    if(pending.provider.toString() !== req.userId){
      console.warn('[declineOffer] provider mismatch', { booking: booking._id, expected: pending.provider.toString(), got: req.userId });
      return res.status(403).json({ message: 'No active offer for you' });
    }
    pending.status = 'declined';
    pending.respondedAt = new Date();
    await advanceOffer(booking);
    res.json({ booking });
  } catch(e){
    console.error('[declineOffer] error', e.stack || e);
    res.status(500).json({ message: 'Internal error declining offer', error: e.message, stack: e.stack });
  }
};

export const myOffers = async (req,res)=>{
  try {
    // Providers only
    const offers = await Booking.find({ status: 'requested', 'offers.provider': req.userId })
      .select('bookingId offers providerResponseTimeout serviceTemplate service')
      .populate('service')
      .populate('serviceTemplate','name')
      .lean();
    const now = new Date();
    const mine = offers.filter(b=>{
      const current = b.offers.find(o=>o.status==='pending');
      return current && current.provider.toString() === req.userId;
    }).map(b=>({
      _id: b._id,
      bookingId: b.bookingId,
      serviceTemplate: b.serviceTemplate,
      service: b.service,
      timeoutAt: b.providerResponseTimeout,
    }));
    res.json({ offers: mine, now });
  } catch(e){ res.status(500).json({ message: e.message }); }
};

// New: provider-visible pending bookings excluding those they rejected or accepted
export const providerAvailableBookings = async (req,res)=>{
  try {
    const providerId = req.userId;
    // Criteria: overallStatus pending, no accepted providerResponses, and either
    //   - no providerResponses for this provider
    //   - or providerResponses for this provider is not rejected
    const query = {
      overallStatus: 'pending',
      $and: [
        { 'providerResponses': { $not: { $elemMatch: { status: 'accepted' } } } },
        { 'providerResponses': { $not: { $elemMatch: { providerId: providerId, status: { $in: ['rejected','accepted'] } } } } }
      ]
    };
    const bookings = await Booking.find(query).select('bookingId serviceTemplate service customer createdAt providerResponses overallStatus').populate('serviceTemplate','name').populate('service','name');
    res.json({ bookings });
  } catch(e){ res.status(500).json({ message: e.message }); }
};

// Admin debug: force advance current pending offer (skip it) – for QA only
export const forceAdvanceOffer = async (req,res)=>{
  try {
    if(req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if(!booking) return res.status(404).json({ message: 'Not found' });
    if(booking.status !== 'requested') return res.status(400).json({ message: 'Booking not in requested state' });
    const current = booking.offers.find(o=>o.status==='pending');
    if(current){
      current.status='expired';
      current.respondedAt=new Date();
    }
    await advanceOffer(booking);
    res.json({ booking });
  } catch(e){ res.status(500).json({ message: e.message }); }
};

// Provider accepts a booking
export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params; // booking _id
    const provider = await User.findById(req.userId);
    if (!provider || provider.role !== "provider")
      return res.status(403).json({ message: "Only providers can accept" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    // New logic: if overallStatus exists use it; fallback to legacy status
    if (booking.overallStatus) {
      if (booking.overallStatus !== 'pending') {
        return res.status(400).json({ message: 'Cannot accept this booking' });
      }
      // Prevent multiple acceptances
      if (booking.providerResponses?.some(r=>r.status==='accepted')) {
        return res.status(400).json({ message: 'Already accepted by another provider' });
      }
      // Check if current provider previously rejected it
      if (booking.providerResponses?.some(r=>r.providerId.toString()===provider._id.toString() && r.status==='rejected')) {
        return res.status(403).json({ message: 'You already rejected this request' });
      }
    } else if (booking.status !== 'requested') {
      return res.status(400).json({ message: 'Cannot accept this booking' });
    }

    // Multi-provider flow: if offers exist, mirror acceptOffer logic
    if (booking.offers && booking.offers.length > 0) {
      await expireIfNeeded(booking);
      const pending = booking.offers.find(o=>o.status==='pending');
      if(!pending || pending.provider.toString() !== req.userId) {
        return res.status(403).json({ message: 'No active offer for you' });
      }
      pending.status = 'accepted';
      pending.respondedAt = new Date();
  booking.status = 'in_progress';
      booking.provider = pending.provider;
      booking.acceptedAt = new Date();
      booking.pendingProviders = [];
      booking.providerResponseTimeout = undefined;
      booking.autoAssignMessage = undefined;
      await booking.save();
      
      // ✅ AUTO-PAUSE GO LIVE: Turn off provider's availability during service
      await User.findByIdAndUpdate(req.userId, {
        isAvailable: false,
        isLiveTracking: false
      });
      
      return res.json({ booking, mode: 'multi', action: 'offer-accepted' });
    }

    // New providerResponses path if overallStatus used
    if (booking.overallStatus) {
      if(!Array.isArray(booking.providerResponses)) booking.providerResponses = [];
      booking.providerResponses.push({ providerId: provider._id, status: 'accepted', respondedAt: new Date() });
      booking.overallStatus = 'in-progress';
      booking.status = 'in_progress'; // keep legacy field synchronized
      booking.provider = provider._id;
      booking.acceptedAt = new Date();
      await booking.save();
      
      // ✅ AUTO-PAUSE GO LIVE: Turn off provider's availability during service
      await User.findByIdAndUpdate(req.userId, {
        isAvailable: false,
        isLiveTracking: false
      });
      
      console.log('[service] Provider %s accepted request %s (now in-progress)', provider._id, booking._id);
      return res.json({ booking, mode: 'providerResponses', action: 'accepted' });
    }

    // Legacy single-provider path (no overallStatus field yet)
    if (booking.provider && booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ message: 'You are not the owner provider for this service' });
    }
    booking.status = 'in_progress';
    booking.provider = provider._id;
    booking.acceptedAt = new Date();
    await booking.save();
    
    // ✅ AUTO-PAUSE GO LIVE: Turn off provider's availability during service
    await User.findByIdAndUpdate(req.userId, {
      isAvailable: false,
      isLiveTracking: false
    });
    
    res.json({ booking, mode: 'legacy' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Provider rejects a booking
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = (req.body && typeof req.body.reason === 'string') ? req.body.reason : '';
    if(!req.body) {
      console.warn('[rejectBooking] req.body was undefined (no JSON payload sent). Defaulting reason to empty string.');
    }
    console.log('[rejectBooking] incoming id=%s reason="%s" user=%s', id, reason, req.userId);
    const provider = await User.findById(req.userId);
    if (!provider || provider.role !== "provider")
      return res.status(403).json({ message: "Only providers can reject" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    console.log('[rejectBooking] booking.status=%s offers=%d overallStatus=%s', booking.status, booking.offers?.length || 0, booking.overallStatus);
    if (booking.overallStatus) {
      if (booking.overallStatus !== 'pending') {
        return res.status(400).json({ message: 'Cannot reject this booking' });
      }
      // If provider already accepted or rejected, enforce idempotency
      const existing = booking.providerResponses?.find(r=>r.providerId.toString()===provider._id.toString());
      if (existing && existing.status === 'rejected') {
        return res.status(200).json({ booking, message: 'Already rejected', mode: 'providerResponses', action: 'already-rejected' });
      }
      if (existing && existing.status === 'accepted') {
        return res.status(400).json({ message: 'You already accepted this booking' });
      }
    } else if (booking.status !== 'requested') {
      return res.status(400).json({ message: 'Cannot reject this booking' });
    }

    // Multi-provider adaptation: decline current offer only (do not mark whole booking rejected yet)
    if (booking.offers && booking.offers.length > 0) {
      await expireIfNeeded(booking);
      const pending = booking.offers.find(o=>o.status==='pending');
      if(!pending || pending.provider.toString() !== req.userId) {
        return res.status(403).json({ message: 'No active offer for you' });
      }
      pending.status = 'declined';
      pending.respondedAt = new Date();
      await advanceOffer(booking);
      console.log('[rejectBooking] multi decline done -> next offer count pending=%d', booking.offers.filter(o=>o.status==='pending').length);
      return res.json({ booking, mode: 'multi', action: 'offer-declined' });
    }

    // If overallStatus mode active, record only provider-specific rejection
    if (booking.overallStatus) {
      if(!Array.isArray(booking.providerResponses)) booking.providerResponses = [];
      const existing = booking.providerResponses.find(r=>r.providerId.toString()===provider._id.toString());
      if (existing) {
        existing.status = 'rejected';
        existing.respondedAt = new Date();
      } else {
        booking.providerResponses.push({ providerId: provider._id, status: 'rejected', respondedAt: new Date() });
      }
      booking.rejectionReason = reason; // last rejection reason; could be extended to array later
      await booking.save();
      console.log('[service] Provider %s rejected request %s', provider._id, booking._id);
      console.log('[service] Remaining visible for other providers');
      return res.json({ booking, mode: 'providerResponses', action: 'rejected' });
    }

    // Legacy path: mark entire booking rejected
    booking.status = 'rejected';
    booking.provider = provider._id;
    booking.rejectionReason = reason;
    await booking.save();
    console.log('[rejectBooking] legacy rejected booking %s saved', booking._id);
    res.json({ booking, mode: 'legacy' });
  } catch (e) {
    console.error('[rejectBooking] error', e);
    res.status(500).json({ message: 'Internal error rejecting booking', error: e.message });
  }
};

// Provider marks booking completed
export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    // Allow legacy 'accepted' (from older releases) OR modern 'in_progress'
    if (!['in_progress','accepted'].includes(booking.status)) {
      return res.status(400).json({ message: "Only in_progress bookings can be completed" });
    }
    if (!booking.provider || booking.provider.toString() !== req.userId) return res.status(403).json({ message: "Not your booking" });
    booking.status = "completed";
    booking.completedAt = new Date();
    booking.reviewStatus = "provider_pending"; // Customer needs to review first
    await booking.save();
    
    // ✅ POST-SERVICE LOCATION UPDATE: Update provider's location to customer's booking location
    if (booking.provider && booking.location) {
      await User.findByIdAndUpdate(booking.provider, {
        location: booking.location,
        lastServiceLocation: booking.location,
        lastServiceCompletedAt: new Date()
      });
    }
    
    // increment provider completedJobs counter (denormalized experience metric)
    if(booking.provider){
      await User.findByIdAndUpdate(booking.provider, { $inc: { completedJobs: 1 } });
    }
    res.json({ booking, needsReview: true, reviewerRole: "provider", waitingFor: "customer" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Customer cancels a booking (before completion)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    if (booking.customer.toString() !== req.userId) return res.status(403).json({ message: "Not your booking" });
  if (!["requested", "in_progress", "accepted"].includes(booking.status)) return res.status(400).json({ message: "Cannot cancel at this stage" });
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();
    res.json({ booking });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Customer marks booking completed (alternative flow) if provider already accepted
export const customerCompleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if(!booking) return res.status(404).json({ message: 'Not found' });
    if(booking.customer.toString() !== req.userId) return res.status(403).json({ message: 'Not your booking' });
    if(booking.status !== 'in_progress') return res.status(400).json({ message: 'Only in_progress bookings can be completed' });
    booking.status = 'completed';
    booking.completedAt = new Date();
    booking.reviewStatus = 'customer_pending'; // Provider needs to review first
    await booking.save();
    
    // ✅ POST-SERVICE LOCATION UPDATE: Update provider's location to customer's booking location
    if (booking.provider && booking.location) {
      await User.findByIdAndUpdate(booking.provider, {
        location: booking.location,
        lastServiceLocation: booking.location,
        lastServiceCompletedAt: new Date()
      });
    }
    
    if(booking.provider){
      await User.findByIdAndUpdate(booking.provider, { $inc: { completedJobs: 1 } });
    }
    res.json({ booking, completedBy: 'customer', needsReview: true, reviewerRole: 'customer', waitingFor: 'provider' });
  } catch(e){ res.status(500).json({ message: e.message }); }
};

// List bookings for current user (role-aware)
export const myBookings = async (req, res) => {
  try {
    if (req.userRole === "customer") {
      const list = await Booking.find({ customer: req.userId })
        .populate({ path: "service", populate: { path: "provider", select: "_id" } })
        .populate("provider", "name rating ratingCount completedJobs")
        .populate('serviceTemplate','name')
        .sort("-createdAt");
      // attach review linkage if completed
      const enriched = await Promise.all(list.map(async b => {
        if (b.status === 'completed') {
          // find reviews for booking (both directions)
          const revs = await Review.find({ booking: b._id }).select('direction rating comment createdAt');
          return { ...b.toObject(), reviews: revs };
        }
        return b;
      }));
      return res.json({ bookings: enriched });
    }
    if (req.userRole === "provider") {
        const providerId = req.userId;
        // wider candidate set: explicit provider, any offer to provider, or unassigned (legacy) for potential service ownership filtering
        const candidates = await Booking.find({
          $or: [
            { provider: providerId },
            { 'offers.provider': providerId },
            { provider: { $exists: false } },
            { provider: null }
          ]
        })
        .populate({ path: 'service', populate: { path: 'provider', select: '_id' } })
        .populate('customer','name')
        .populate('serviceTemplate','name')
        .sort('-createdAt');

        const list = candidates.filter(b => {
          if (b.provider && b.provider.toString() === providerId) return true; // assigned to me
          const serviceOwner = b.service && b.service.provider && b.service.provider._id ? b.service.provider._id.toString() : (b.service && b.service.provider && b.service.provider.toString());
            // show if I was initial service owner (legacy pre-offer model)
          if (!b.provider && serviceOwner === providerId) return true;
          // show if I had (or have) any offer in offers array
          if (b.offers && b.offers.some(o=> o.provider && o.provider.toString() === providerId)) return true;
          return false;
        });

        const enriched = await Promise.all(list.map(async b => {
          const obj = b.toObject();
          // Determine this provider's offer status (latest offer occurrence)
          if (obj.offers && obj.offers.length) {
            const mine = [...obj.offers].reverse().find(o=> o.provider && o.provider.toString() === providerId);
            if (mine) obj.providerOfferStatus = mine.status; // pending|declined|accepted|expired
          }
          if (b.status === 'completed') {
            const revs = await Review.find({ booking: b._id }).select('direction rating comment createdAt');
            obj.reviews = revs;
          }
          return obj;
        }));
        return res.json({ bookings: enriched });
    }
    return res.status(400).json({ message: "Unsupported role" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get pending job count for provider
export const getPendingCount = async (req, res) => {
  try {
    const providerId = req.userId;
    
    // Count bookings where:
    // 1. Status is 'requested' or 'pending_offers'
    // 2. Provider has a pending offer OR is assigned provider
    const bookings = await Booking.find({
      status: { $in: ['requested', 'pending_offers'] }
    }).populate('service', 'provider');

    const count = bookings.filter(b => {
      // If directly assigned to this provider
      if (b.provider && b.provider.toString() === providerId) return true;
      // If service owner (legacy)
      const serviceOwner = b.service && b.service.provider && b.service.provider.toString();
      if (!b.provider && serviceOwner === providerId) return true;
      // If has a pending offer
      if (b.offers && b.offers.some(o => 
        o.provider && o.provider.toString() === providerId && o.status === 'pending'
      )) return true;
      return false;
    }).length;

    res.json({ count });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
