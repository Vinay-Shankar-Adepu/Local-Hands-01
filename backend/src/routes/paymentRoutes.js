import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

//
// 🪙 Initialize Razorpay
//
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//
// 🧾 Route 1: Create Razorpay Order
//
router.post("/create-order", requireAuth, async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    if (!bookingId || !amount)
      return res.status(400).json({ message: "Missing bookingId or amount" });

    const booking = await Booking.findById(bookingId)
      .populate("provider customer")
      .lean();

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // ₹ → paise
      currency: "INR",
      receipt: `receipt_${booking.bookingId}`,
      notes: { bookingId: booking.bookingId },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      bookingId: booking._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({ message: "Error creating Razorpay order", error: error.message });
  }
});

//
// 💳 Route 2: Verify Razorpay Payment
//
router.post("/verify-payment", requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: "Missing payment verification data" });

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ message: "Invalid payment signature" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // ✅ Update booking state
    booking.paymentStatus = "paid";
    booking.paymentMethod = "razorpay";
    booking.paymentId = razorpay_payment_id;
    booking.status = "paid";
    booking.overallStatus = "completed";
    booking.paymentVerifiedAt = new Date();
    booking.completedAt = new Date();
    booking.reviewStatus = "both_pending";
    await booking.save();

    // ✅ Safely update provider & customer stats
    const provider = await User.findById(booking.provider);
    const customer = await User.findById(booking.customer);

    if (provider) {
      provider.totalEarnings = (provider.totalEarnings || 0) + (booking.billAmount || 0);
      provider.walletBalance = (provider.walletBalance || 0) + (booking.billAmount || 0);
      provider.completedJobs = (provider.completedJobs || 0) + 1;
      provider.lastPaymentReceivedAt = new Date();
      provider.lastPaymentAmount = booking.billAmount || 0;
      provider.paymentHistory = provider.paymentHistory || [];
      provider.paymentHistory.push({
        bookingId: booking._id,
        amount: booking.billAmount || 0,
        method: "razorpay",
      });
      await provider.save();
    }

    if (customer) {
      customer.servicesCompleted = (customer.servicesCompleted || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + (booking.billAmount || 0);
      customer.paymentHistory = customer.paymentHistory || [];
      customer.paymentHistory.push({
        bookingId: booking._id,
        amount: booking.billAmount || 0,
        method: "razorpay",
      });
      await customer.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment verified and booking updated successfully",
      bookingId,
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({ message: "Payment verification failed", error: error.message });
  }
});

//
// 💵 Route 3: Mark Payment as Cash (Offline Payments)
//
router.post("/cash-payment", requireAuth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: "Missing bookingId" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = "paid";
    booking.paymentMethod = "cash";
    booking.paymentId = `CASH-${Date.now()}`;
    booking.status = "paid";
    booking.overallStatus = "completed";
    booking.completedAt = new Date();
    booking.reviewStatus = "both_pending";
    await booking.save();

    const provider = await User.findById(booking.provider);
    const customer = await User.findById(booking.customer);

    if (provider) {
      provider.totalEarnings = (provider.totalEarnings || 0) + (booking.billAmount || 0);
      provider.walletBalance = (provider.walletBalance || 0) + (booking.billAmount || 0);
      provider.completedJobs = (provider.completedJobs || 0) + 1;
      provider.paymentHistory = provider.paymentHistory || [];
      provider.paymentHistory.push({
        bookingId: booking._id,
        amount: booking.billAmount || 0,
        method: "cash",
      });
      await provider.save();
    }

    if (customer) {
      customer.servicesCompleted = (customer.servicesCompleted || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + (booking.billAmount || 0);
      customer.paymentHistory = customer.paymentHistory || [];
      customer.paymentHistory.push({
        bookingId: booking._id,
        amount: booking.billAmount || 0,
        method: "cash",
      });
      await customer.save();
    }

    res.status(200).json({
      success: true,
      message: "Cash payment recorded successfully",
      bookingId,
    });
  } catch (error) {
    console.error("❌ Error recording cash payment:", error);
    res.status(500).json({ message: "Cash payment update failed", error: error.message });
  }
});

export default router;
