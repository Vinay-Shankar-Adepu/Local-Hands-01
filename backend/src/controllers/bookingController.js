import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import { nextBookingId } from "../utils/generateId.js";

// Customer creates booking request at location
export const createBooking = async (req, res) => {
  try {
    const { serviceId, lng, lat, scheduledAt } = req.body;
    if (!serviceId || typeof lng !== "number" || typeof lat !== "number")
      return res.status(400).json({ message: "serviceId, lng, lat required" });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

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

// Provider accepts a booking
export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params; // booking _id
    const provider = await User.findById(req.userId);
    if (!provider || provider.role !== "provider")
      return res.status(403).json({ message: "Only providers can accept" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    if (booking.status !== "requested")
      return res.status(400).json({ message: "Cannot accept this booking" });
    if (booking.provider && booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ message: "You are not the owner provider for this service" });
    }

    booking.status = "accepted";
    booking.provider = provider._id; // ensure set (in case was null in future multi-provider variant)
    booking.acceptedAt = new Date();
    await booking.save();

    res.json({ booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Provider rejects a booking
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "" } = req.body;
    const provider = await User.findById(req.userId);
    if (!provider || provider.role !== "provider")
      return res.status(403).json({ message: "Only providers can reject" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    if (booking.status !== "requested")
      return res.status(400).json({ message: "Cannot reject this booking" });

    booking.status = "rejected";
    booking.provider = provider._id; // claim attempted provider; optional
    booking.rejectionReason = reason;
    await booking.save();
    res.json({ booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Provider marks booking completed
export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });
    if (booking.status !== "accepted") return res.status(400).json({ message: "Only accepted bookings can be completed" });
    if (!booking.provider || booking.provider.toString() !== req.userId) return res.status(403).json({ message: "Not your booking" });
    booking.status = "completed";
    booking.completedAt = new Date();
    await booking.save();
    res.json({ booking });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// List bookings for current user (role-aware)
export const myBookings = async (req, res) => {
  try {
    if (req.userRole === "customer") {
      const list = await Booking.find({ customer: req.userId })
  .populate({ path: "service", populate: { path: "provider", select: "_id" } })
        .populate("provider", "name rating ratingCount")
        .sort("-createdAt");
      return res.json({ bookings: list });
    }
    if (req.userRole === "provider") {
        // Include legacy bookings where provider not yet assigned but service owned by this provider
        const candidates = await Booking.find({
          $or: [
            { provider: req.userId },
            { provider: { $exists: false } },
            { provider: null }
          ]
        })
          .populate("service")
          .populate("customer", "name")
          .sort("-createdAt");
        const list = candidates.filter(b => {
          if (b.provider) return b.provider.toString() === req.userId;
          // provider missing: compare service ownership
          return b.service && b.service.provider && b.service.provider.toString() === req.userId;
        });
        return res.json({ bookings: list });
    }
    return res.status(400).json({ message: "Unsupported role" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
