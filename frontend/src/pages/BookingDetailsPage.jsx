import React, { useState } from "react";
import PaymentModal from "../components/PaymentModal";

const BookingDetailsPage = ({ booking }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePayNow = () => {
    setShowPaymentModal(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Booking Details</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <p>Service: {booking?.service?.name}</p>
        <p>Amount: ₹{booking?.billAmount}</p>
        <p>Status: {booking?.status}</p>
        <button
          onClick={handlePayNow}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Pay Now
        </button>
      </div>

      {/* 💳 Payment Bottom Sheet */}
      <PaymentModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        booking={booking}
      />
    </div>
  );
};

export default BookingDetailsPage;
