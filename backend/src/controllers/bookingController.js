import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import ServiceTemplate from "../models/ServiceTemplate.js";
import { nextBookingId } from "../utils/generateId.js";
import Review from "../models/Review.js";
import mongoose from "mongoose";

/* --------------------------------------------------
   🧾 CUSTOMER CREATES BOOKING REQUEST
-------------------------------------------------- */
export const createBooking = async (req, res) => {
  try {
    const { serviceId, lng, lat, scheduledAt } = req.body;
    if (!serviceId || typeof lng !== "number" || typeof lat !== "number")
      return res.status(400).json({ message: "serviceId, lng, lat required" });

    const service = await Service.findById(serviceId).populate("template");
    if (!service) return res.status(404).json({ message: "Service not found" });
    if (!service.template)
      return res.status(400).json({ message: "Service not available" });
    if (service.template && service.template.active === false)
      return res.status(400).json({ message: "Service template inactive" });

    const bookingId = await nextBookingId();

    const booking = await Booking.create({
      bookingId,
      customer: req.userId,
      service: service._id,
      provider: service.provider || undefined,
      location: { type: "Point", coordinates: [lng, lat] },
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      status: "requested",
      paymentStatus: "pending",
    });

    res.json({ booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* --------------------------------------------------
   🧭 MULTI-PROVIDER BOOKING CREATION
-------------------------------------------------- */
const OFFER_TIMEOUT_MS = 10 * 1000;

async function computeProviderExperience(providerId) {
  const user = await User.findById(providerId).select("completedJobs");
  return user?.completedJobs || 0;
}

export const createBookingMulti = async (req, res) => {
  try {
    const { templateId, lng, lat, scheduledAt } = req.body;
    if (!templateId || typeof lng !== "number" || typeof lat !== "number") {
      return res
        .status(400)
        .json({ message: "templateId, lng, lat required" });
    }
    const template = await ServiceTemplate.findById(templateId);
    if (!template) return res.status(404).json({ message: "Template not found" });
    if (template.active === false)
      return res.status(400).json({ message: "Template inactive" });

    const services = await Service.find({ template: template._id }).populate(
      "provider",
      "name rating ratingCount isAvailable"
    );

    const liveServices = [];
    for (const s of services) {
      if (!s.provider) continue;
      const fresh = await User.findById(s.provider._id).select(
        "isAvailable rating ratingCount"
      );
      if (fresh && fresh.isAvailable) {
        s.provider.isAvailable = true;
        liveServices.push(s);
      }
    }

    if (liveServices.length === 0) {
      return res.status(400).json({
        message: "No live providers available for this service right now",
      });
    }

    const ranked = [];
    for (const s of liveServices) {
      const exp = await computeProviderExperience(s.provider._id);
      ranked.push({
        service: s,
        provider: s.provider,
        rating: s.provider.rating || 0,
        experience: exp,
      });
    }
    ranked.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.experience !== a.experience) return b.experience - a.experience;
      return a.provider._id
        .toString()
        .localeCompare(b.provider._id.toString());
    });

    const bookingId = await nextBookingId();
    const now = new Date();
    const first = ranked[0];
    const queue = ranked.slice(1).map((r) => r.provider._id);

    const booking = await Booking.create({
      bookingId,
      customer: req.userId,
      service: first.service._id,
      provider: undefined,
      serviceTemplate: template._id,
      location: { type: "Point", coordinates: [lng, lat] },
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      status: "requested",
      overallStatus: "pending",
      paymentStatus: "pending",
      pendingProviders: queue,
      offers: [
        { provider: first.provider._id, status: "pending", offeredAt: now },
      ],
      providerResponseTimeout: new Date(now.getTime() + OFFER_TIMEOUT_MS),
      autoAssignMessage: "Searching for best available provider...",
      pendingExpiresAt: new Date(now.getTime() + 5 * 60 * 1000),
    });

    return res.json({
      booking,
      message: "Request sent. The best available provider will be assigned shortly.",
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* --------------------------------------------------
   🧠 OFFER MANAGEMENT HELPERS
-------------------------------------------------- */
async function advanceOffer(booking) {
  try {
    if (!booking) return;
    if (!Array.isArray(booking.offers)) booking.offers = [];
    if (!Array.isArray(booking.pendingProviders)) booking.pendingProviders = [];

    while (booking.pendingProviders && booking.pendingProviders.length > 0) {
      const nextProviderId = booking.pendingProviders.shift();
      if (!nextProviderId) continue;
      const prov = await User.findById(nextProviderId).select("isAvailable");
      if (prov && prov.isAvailable) {
        booking.offers.push({
          provider: nextProviderId,
          status: "pending",
          offeredAt: new Date(),
        });
        booking.providerResponseTimeout = new Date(Date.now() + OFFER_TIMEOUT_MS);
        await booking.save();
        return;
      }
    }

    booking.providerResponseTimeout = undefined;
    if (!booking.offers.find((o) => o.status === "pending")) {
      booking.autoAssignMessage = "No live providers currently available.";
    }
    await booking.save();
  } catch (err) {
    console.error("[advanceOffer] error", err);
    throw err;
  }
}

async function expireIfNeeded(booking) {
  if (!booking.offers || booking.offers.length === 0) return;
  const current = booking.offers.find((o) => o.status === "pending");
  if (!current) return;
  if (
    booking.providerResponseTimeout &&
    booking.providerResponseTimeout < new Date()
  ) {
    current.status = "expired";
    current.respondedAt = new Date();
    await advanceOffer(booking);
  }
}

/* --------------------------------------------------
   💬 OFFER / ACCEPTANCE LOGIC
-------------------------------------------------- */
export const acceptOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("service");
    if (!booking) return res.status(404).json({ message: "Not found" });
    if (booking.status !== "requested")
      return res.status(400).json({ message: "Cannot accept now" });
    await expireIfNeeded(booking);

    const pending = booking.offers.find((o) => o.status === "pending");
    if (!pending || pending.provider.toString() !== req.userId)
      return res.status(403).json({ message: "No active offer for you" });

    pending.status = "accepted";
    pending.respondedAt = new Date();
    booking.status = "in_progress";
    booking.provider = pending.provider;
    booking.acceptedAt = new Date();
    booking.pendingProviders = [];
    booking.providerResponseTimeout = undefined;
    booking.autoAssignMessage = undefined;
    await booking.save();

    await User.findByIdAndUpdate(req.userId, {
      isAvailable: false,
      isLiveTracking: false,
    });

    res.json({ booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const declineOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    if (booking.status !== "requested")
      return res.status(400).json({ message: "Cannot decline now" });
    await expireIfNeeded(booking);

    const pending = booking.offers.find((o) => o.status === "pending");
    if (!pending || pending.provider.toString() !== req.userId)
      return res.status(403).json({ message: "No active offer for you" });

    pending.status = "declined";
    pending.respondedAt = new Date();
    await advanceOffer(booking);

    res.json({ booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* --------------------------------------------------
   ⚙️ ACCEPT / REJECT (Provider Actions)
-------------------------------------------------- */
export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await User.findById(req.userId);
    if (!provider || provider.role !== "provider")
      return res.status(403).json({ message: "Only providers can accept" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });

    if (!["requested"].includes(booking.status))
      return res.status(400).json({ message: "Cannot accept this booking" });

    booking.status = "in_progress";
    booking.provider = provider._id;
    booking.acceptedAt = new Date();
    await booking.save();

    await User.findByIdAndUpdate(req.userId, {
      isAvailable: false,
      isLiveTracking: false,
    });

    res.json({ booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* --------------------------------------------------
   🧾 PROVIDER BILLING (Mark Complete + Bill)
-------------------------------------------------- */
export const markCompleteWithBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { extraCharges = 0 } = req.body;
    const providerId = req.userId;

    const booking = await Booking.findById(id).populate("customer provider");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!booking.provider || booking.provider._id.toString() !== providerId)
      return res.status(403).json({ message: "You are not assigned to this booking" });

    if (!["in_progress", "accepted"].includes(booking.status))
      return res.status(400).json({ message: "Only in-progress bookings can be marked complete" });

    const totalBill = (booking.basePrice || 0) + Number(extraCharges);

    booking.extraCharges = Number(extraCharges);
    booking.billAmount = totalBill;
    booking.status = "completed_by_provider";
    booking.markedCompleteAt = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking marked completed. Awaiting customer payment.",
      billAmount: totalBill,
    });
  } catch (error) {
    console.error("[markCompleteWithBill] error:", error);
    res.status(500).json({ message: "Error marking complete", error: error.message });
  }
};

/* --------------------------------------------------
   💰 CUSTOMER CONFIRMS AFTER PAYMENT
-------------------------------------------------- */
export const customerConfirmCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.userId;

    const booking = await Booking.findById(id).populate("provider customer");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.customer._id.toString() !== customerId)
      return res.status(403).json({ message: "You are not the customer" });

    if (booking.paymentStatus !== "paid")
      return res.status(400).json({ message: "Payment must be completed first" });

    booking.status = "completed";
    booking.overallStatus = "completed";
    booking.completedAt = new Date();
    booking.reviewStatus = "both_pending";
    await booking.save();

    if (booking.provider) {
      await User.findByIdAndUpdate(booking.provider._id, {
        $inc: { completedJobs: 1 },
        lastServiceCompletedAt: new Date(),
        lastServiceLocation: booking.location,
        isAvailable: true,
      });
    }

    await User.findByIdAndUpdate(customerId, { $inc: { servicesCompleted: 1 } });

    res.json({
      success: true,
      message: "Booking fully completed.",
      booking,
    });
  } catch (error) {
    console.error("[customerConfirmCompletion] error:", error);
    res.status(500).json({ message: "Error confirming completion", error: error.message });
  }
};

/* --------------------------------------------------
   📋 REMAINING (Cancel, MyBookings, Get Count)
-------------------------------------------------- */
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    if (booking.customer.toString() !== req.userId)
      return res.status(403).json({ message: "Not your booking" });
    if (!["requested", "in_progress", "accepted"].includes(booking.status))
      return res.status(400).json({ message: "Cannot cancel at this stage" });
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();
    res.json({ booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* --------------------------------------------------
   🧾 MY BOOKINGS (Customer + Provider)
-------------------------------------------------- */
export const myBookings = async (req, res) => {
  try {
    if (req.userRole === "customer") {
      const list = await Booking.find({ customer: req.userId })
        .populate("service")
        .populate("provider", "name rating ratingCount completedJobs")
        .populate("serviceTemplate", "name")
        .sort("-createdAt");

      const enriched = await Promise.all(
        list.map(async (b) => {
          if (b.status === "completed") {
            const revs = await Review.find({ booking: b._id }).select(
              "direction rating comment createdAt"
            );
            return { ...b.toObject(), reviews: revs };
          }
          return b;
        })
      );
      return res.json({ bookings: enriched });
    }

    if (req.userRole === "provider") {
      const providerId = req.userId;
      const candidates = await Booking.find({
        $or: [
          { provider: providerId },
          { "offers.provider": providerId },
          { provider: { $exists: false } },
          { provider: null },
        ],
      })
        .populate("service")
        .populate("customer", "name")
        .populate("serviceTemplate", "name")
        .sort("-createdAt");

      const list = candidates.filter((b) => {
        if (b.provider && b.provider.toString() === providerId) return true;
        if (b.offers && b.offers.some((o) => o.provider.toString() === providerId))
          return true;
        return false;
      });

      return res.json({ bookings: list });
    }

    return res.status(400).json({ message: "Unsupported role" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* --------------------------------------------------
   📊 GET PENDING COUNT FOR PROVIDER
-------------------------------------------------- */
export const getPendingCount = async (req, res) => {
  try {
    const providerId = req.userId;
    const bookings = await Booking.find({
      status: { $in: ["requested", "pending_offers"] },
    }).populate("service", "provider");

    const count = bookings.filter((b) => {
      if (b.provider && b.provider.toString() === providerId) return true;
      const serviceOwner =
        b.service && b.service.provider && b.service.provider.toString();
      if (!b.provider && serviceOwner === providerId) return true;
      if (
        b.offers &&
        b.offers.some(
          (o) =>
            o.provider &&
            o.provider.toString() === providerId &&
            o.status === "pending"
        )
      )
        return true;
      return false;
    }).length;

    res.json({ count });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
