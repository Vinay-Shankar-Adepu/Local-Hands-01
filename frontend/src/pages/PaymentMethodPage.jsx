import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadRazorpayScript } from "../utils/razorpay";
import { createRazorpayOrder, verifyRazorpayPayment, markCashPayment } from "../api/paymentAPI";
import axios from "axios";

const PaymentMethodPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const handleCashPayment = async () => {
    try {
      const response = await markCashPayment(bookingId);
      if (response.success) {
        await axios.patch(`/api/bookings/${bookingId}/customer-confirm`);
        navigate(`/payment-success/${bookingId}`);
      }
    } catch (error) {
      console.error("❌ Cash payment failed:", error);
      alert("Failed to record cash payment.");
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Razorpay SDK failed to load.");
        return;
      }

      const { data } = await axios.get(`/api/bookings/${bookingId}`);
      const booking = data.booking;
      const totalAmount = booking.billAmount || booking.basePrice || 0;

      const order = await createRazorpayOrder(bookingId, totalAmount);

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "LocalHands",
        description: `Payment for booking ${booking.bookingId}`,
        order_id: order.orderId,
        prefill: {
          name: booking.customer?.name || "Customer",
          email: booking.customer?.email || "user@example.com",
          contact: booking.customer?.phone || "9999999999",
        },
        handler: async function (response) {
          const verifyRes = await verifyRazorpayPayment({
            ...response,
            bookingId,
          });
          if (verifyRes.success) {
            await axios.patch(`/api/bookings/${bookingId}/customer-confirm`);
            navigate(`/payment-success/${bookingId}`);
          } else {
            alert("Payment verification failed!");
          }
        },
        theme: { color: "#2E8B57" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("❌ Razorpay payment failed:", error);
      alert("Failed to initiate payment.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-green-50">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Choose Payment Method
      </h1>

      <div className="flex flex-col gap-4">
        <button
          onClick={handleRazorpayPayment}
          className="px-8 py-3 text-lg bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md transition-all"
        >
          💳 Pay with Razorpay
        </button>

        <button
          onClick={handleCashPayment}
          className="px-8 py-3 text-lg bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 shadow-md transition-all"
        >
          💵 Pay with Cash
        </button>
      </div>

      <p className="mt-6 text-gray-500 text-sm">
        Secure payments powered by Razorpay | Cash payments handled on-site
      </p>
    </div>
  );
};

export default PaymentMethodPage;
