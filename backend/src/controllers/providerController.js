import User from "../models/User.js";
import Booking from "../models/Booking.js";
import mongoose from 'mongoose';

// Provider toggles availability (Go Live mode)
export const setAvailability = async (req, res) => {
  try {
    const { isAvailable, lng, lat } = req.body;
    
    // ✅ Check if provider has an active in_progress booking
    const activeBooking = await Booking.findOne({
      provider: req.userId,
      status: 'in_progress'
    });
    
    // ✅ Don't allow going live if there's an active service
    if (isAvailable && activeBooking) {
      return res.status(400).json({ 
        message: 'Cannot go live while you have an active service in progress. Complete the current service first.',
        activeBooking: activeBooking.bookingId
      });
    }
    
    const updateFields = { 
      isAvailable: !!isAvailable,
      isLiveTracking: !!isAvailable // Enable/disable live tracking based on availability
    };
    
    // ✅ When toggling Go Live ON, update location if provided
    if (isAvailable && lng !== undefined && lat !== undefined) {
      if (typeof lng === "number" && typeof lat === "number") {
        updateFields.location = { type: "Point", coordinates: [lng, lat] };
        updateFields.lastLocationUpdate = new Date();
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateFields,
      { new: true }
    ).select("-password");

    // If provider is going offline, expire any pending offers they currently hold so queue can advance
    if(isAvailable === false){
      const providerId = new mongoose.Types.ObjectId(req.userId);
      const affected = await Booking.find({ status: 'requested', 'offers.provider': providerId });
      for(const b of affected){
        const pending = b.offers.find(o=>o.status==='pending' && o.provider.toString() === req.userId);
        if(pending){
          pending.status = 'expired';
          pending.respondedAt = new Date();
          // pull next provider (re-using advanceOffer logic would create circular import; inline simplified)
          while(b.pendingProviders && b.pendingProviders.length > 0){
            const nextId = b.pendingProviders.shift();
            const np = await User.findById(nextId).select('isAvailable');
            if(np && np.isAvailable){
              b.offers.push({ provider: nextId, status: 'pending', offeredAt: new Date() });
              b.providerResponseTimeout = new Date(Date.now() + 10*1000); // 10 seconds
              break;
            }
          }
          if(!b.offers.find(o=>o.status==='pending')){
            b.providerResponseTimeout = undefined;
            b.autoAssignMessage = 'No live providers currently available.';
          }
          await b.save();
        }
      }
    }
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update provider live location (lng, lat)
export const updateLocation = async (req, res) => {
  try {
    const { lng, lat } = req.body;
    if (typeof lng !== "number" || typeof lat !== "number")
      return res.status(400).json({ message: "lng/lat required (numbers)" });

    // ✅ Only update location if provider is in live tracking mode
    const provider = await User.findById(req.userId).select('isLiveTracking isAvailable');
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    
    // ✅ Check if provider has an active in_progress booking - if so, don't update location
    const activeBooking = await Booking.findOne({
      provider: req.userId,
      status: 'in_progress'
    });
    
    if (activeBooking) {
      return res.status(400).json({ 
        message: 'Location update paused during active service',
        reason: 'Service in progress - location will update after completion'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        location: { type: "Point", coordinates: [lng, lat] },
        lastLocationUpdate: new Date()
      },
      { new: true }
    ).select("-password");
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Find nearby providers within radiusKm (defaults 3km)
export const nearbyProviders = async (req, res) => {
  try {
    const { lng, lat, radiusKm = 3 } = req.query;
    if (lng === undefined || lat === undefined)
      return res.status(400).json({ message: "lng & lat are required" });

    const meters = Number(radiusKm) * 1000;
    const providers = await User.find({
      role: "provider",
      isAvailable: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: meters
        }
      }
    }).select("-password");

    res.json({ providers });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Provider onboarding flags (mock; you’ll wire to uploads later)
export const submitOnboarding = async (req, res) => {
  try {
    const { documents = [], selfie = "", otpVerified = false } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { documents, selfie, otpVerified },
      { new: true }
    ).select("-password");
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
