import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";
import Lottie from "lottie-react";
import successAnim from "../assets/success_tick.json"; // ✅ Add this file under /src/assets
import {
  loadRazorpayScript,
  createRazorpayOrder,
  verifyRazorpayPayment,
  markCashPayment,
} from "../services/paymentAPI";

const PaymentModal = ({ show, onClose, booking, onPaymentSuccess }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  if (!show || !booking) return null;

  const triggerSuccessAnimation = async () => {
    setShowSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2s
    setShowSuccess(false);
    onClose();
    onPaymentSuccess?.();
  };

  const handleCashPayment = async () => {
    try {
      const res = await markCashPayment(booking._id);
      if (res?.data?.success) {
        toast.success("💵 Cash payment recorded successfully!");
        await axios.patch(`/api/bookings/${booking._id}/customer-complete`);
        await triggerSuccessAnimation();
      } else {
        toast.error("Failed to record cash payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error recording cash payment");
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load.");
        return;
      }

      const amount = booking.billAmount || booking.service?.price || 0;
      const { data: order } = await createRazorpayOrder({
        bookingId: booking._id,
        amount,
      });

      const options = {
        key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "LocalHands",
        description: `Payment for booking #${booking.bookingId}`,
        order_id: order.id,
        prefill: {
          name: booking.customer?.name || "Customer",
          email: booking.customer?.email || "customer@example.com",
          contact: booking.customer?.phone || "9999999999",
        },
        handler: async function (response) {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });

            if (verifyRes?.data?.success) {
              toast.success("✅ Payment successful!");
              await axios.patch(`/api/bookings/${booking._id}/customer-complete`);
              await triggerSuccessAnimation();
            } else {
              toast.error("Payment verification failed!");
            }
          } catch (err) {
            console.error(err);
            toast.error("Error verifying payment");
          }
        },
        theme: { color: "#22c55e" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      toast.error("Failed to initiate payment");
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* 🔹 Payment Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full sm:w-[420px] bg-white dark:bg-gray-800 rounded-t-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Choose Payment Method
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRazorpayPayment}
                  className="w-full py-3 bg-green-600 text-white rounded-xl text-lg font-medium hover:bg-green-700 transition-all"
                >
                  💳 Pay with Razorpay
                </button>

                <button
                  onClick={handleCashPayment}
                  className="w-full py-3 bg-yellow-500 text-white rounded-xl text-lg font-medium hover:bg-yellow-600 transition-all"
                >
                  💵 Pay with Cash
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payments powered by Razorpay
              </p>
            </motion.div>
          </motion.div>

          {/* ✅ Success Animation Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                key="success-overlay"
                className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[60]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 120, damping: 15 }}
                  className="flex flex-col items-center text-center bg-white/80 dark:bg-gray-800/90 p-8 rounded-2xl shadow-xl"
                >
                  <Lottie
                    animationData={successAnim}
                    loop={false}
                    className="w-36 h-36 mb-2"
                  />
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    Payment Successful!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Redirecting to booking summary...
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
