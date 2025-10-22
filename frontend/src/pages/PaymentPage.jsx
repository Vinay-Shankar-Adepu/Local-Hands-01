import React, { useEffect } from "react";
import { loadRazorpayScript } from "../utils/razorpay";
import { createPaymentOrder, verifyPayment } from "../api/paymentAPI";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  useEffect(() => {
    initiatePayment();
  }, []);

  const initiatePayment = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Failed to load Razorpay SDK");
      return;
    }

    // Get booking details from backend
    const { data } = await axios.get(`/api/bookings/${bookingId}`);
    const booking = data.booking;
    const totalAmount = booking.billAmount || booking.basePrice;

    // Create order in backend
    const orderData = await createPaymentOrder(bookingId, totalAmount);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: "INR",
      name: "LocalHands",
      description: `Payment for booking ${booking.bookingId}`,
      order_id: orderData.id,
      prefill: {
        name: booking.customer?.name || "Customer",
        email: booking.customer?.email || "user@example.com",
        contact: booking.customer?.phone || "9999999999",
      },
      handler: async function (response) {
        // Verify signature
        const paymentResult = await verifyPayment({
          ...response,
          bookingId,
        });

        if (paymentResult.success) {
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
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h2 className="text-xl font-semibold text-gray-700">
        Loading Razorpay checkout...
      </h2>
    </div>
  );
};

export default PaymentPage;
