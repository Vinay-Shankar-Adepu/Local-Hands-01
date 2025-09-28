import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import { nextBookingId } from "../utils/generateId.js";

// Customer creates booking request at location
export const createBooking = async (req, res) => {
  try {
    const { serviceId, lng, lat } = req.body;
    if (!serviceId || typeof lng !== "number" || typeof lat !== "number")
      return res.status(400).json({ message: "serviceId, lng, lat required" });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const bookingId = await nextBookingId();

    const booking = await Booking.create({
      bookingId,
      customer: req.userId,
      service: service._id,
      location: { type: "Point", coordinates: [lng, lat] },
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

    booking.status = "accepted";
    booking.provider = provider._id;
    await booking.save();

    res.json({ booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// List bookings for current user (role-aware)
export const myBookings = async (req, res) => {
  try {
    if (req.userRole === "customer") {
      const list = await Booking.find({ customer: req.userId })
        .populate("service")
        .populate("provider", "name rating ratingCount")
        .sort("-createdAt");
      return res.json({ bookings: list });
    }
    if (req.userRole === "provider") {
      const list = await Booking.find({ provider: req.userId })
        .populate("service")
        .populate("customer", "name")
        .sort("-createdAt");
      return res.json({ bookings: list });
    }
    return res.status(400).json({ message: "Unsupported role" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
