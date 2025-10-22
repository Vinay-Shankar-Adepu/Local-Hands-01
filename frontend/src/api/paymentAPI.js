import axios from "axios";

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = (data) =>
  axios.post("/api/payments/create-order", data);

export const verifyRazorpayPayment = (data) =>
  axios.post("/api/payments/verify", data);

export const markCashPayment = (bookingId) =>
  axios.post(`/api/payments/cash/${bookingId}`);
