import React from "react";
import { useParams, Link } from "react-router-dom";

const PaymentSuccess = () => {
  const { bookingId } = useParams();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50">
      <h1 className="text-4xl font-bold text-green-700 mb-4">
        Payment Successful 🎉
      </h1>
      <p className="text-gray-700 mb-2">
        Your payment for booking <strong>{bookingId}</strong> was successful.
      </p>
      <p className="text-gray-600 mb-4">
        You can now track your service or leave a review.
      </p>
      <Link
        to="/my-bookings"
        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Go to My Bookings
      </Link>
    </div>
  );
};

export default PaymentSuccess;
