import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

//
// 🪙 Initialize Razorpay instance
//
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET,
});

//
// 🧾 Create Razorpay Order
//
export const createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ message: "bookingId and amount are required" });
    }

    const booking = await Booking.findById(bookingId).populate("provider customer");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const options = {
      amount: Math.round(amount * 100), // amount in paise
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
    res.status(500).json({
      message: "Error creating Razorpay order",
      error: error.message,
    });
  }
};

//
// 💳 Verify Razorpay Payment + Update Booking + Stats
//
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification data" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = generatedSignature === razorpay_signature;
    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // ✅ Update booking payment + completion state
    booking.paymentStatus = "paid";
    booking.paymentMethod = "razorpay";
    booking.paymentId = razorpay_payment_id;
    booking.status = "paid";
    booking.overallStatus = "completed";
    booking.paymentVerifiedAt = new Date();
    booking.completedAt = new Date();
    booking.reviewStatus = "both_pending";

    await booking.save();

    // ✅ Update provider & customer stats
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
    console.error("❌ Payment verification failed:", error);
    res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
};
