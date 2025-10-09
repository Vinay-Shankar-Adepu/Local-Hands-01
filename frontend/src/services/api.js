import axios from "axios";

// 🌐 Base URL — auto switches between local & production
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:5000/api",
  withCredentials: true, // ensures cookies & tokens travel together if needed
});

// ------------------------
// 🔐 Auth Interceptors
// ------------------------

// ✅ Attach JWT on every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("lh_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ✅ Handle expired/invalid token globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("Session expired. Redirecting to login...");
      localStorage.removeItem("lh_token");
      localStorage.removeItem("lh_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ------------------------
// ⚙️ Generic HTTP Helpers
// ------------------------
export const get = (url, config = {}) => API.get(url, config);
export const post = (url, data, config = {}) => API.post(url, data, config);
export const put = (url, data, config = {}) => API.put(url, data, config);
export const del = (url, config = {}) => API.delete(url, config);

// ------------------------
// 📦 Booking APIs
// ------------------------
export const BookingAPI = {
  create: (payload) => API.post("/bookings/create", payload),
  mine: () => API.get("/bookings/mine"),
  accept: (id) => API.patch(`/bookings/${id}/accept`),
  reject: (id, reason = "") => API.patch(`/bookings/${id}/reject`, { reason }),
};

// ------------------------
// 🧾 Service APIs
// ------------------------
export const ServiceAPI = {
  list: () => API.get("/services"),
  mine: () => API.get("/services/mine"),
};

// ------------------------
// 👤 User APIs
// ------------------------
export const UserAPI = {
  me: () => API.get("/users/me"),
  updateMe: (payload) => API.patch("/users/me", payload),
};

// ------------------------
// 🧑‍🔧 Provider APIs
// ------------------------
export const ProviderAPI = {
  availability: (isAvailable) =>
    API.patch("/providers/availability", { isAvailable }),
  goLive: () => API.patch("/providers/go-live"),
  goOffline: () => API.patch("/providers/go-offline"),
  updateLocation: (lng, lat) =>
    API.patch("/providers/location", { lng, lat }),
};

// ------------------------
// 🪪 Verification APIs
// ------------------------
export const VerificationAPI = {
  // 🔹 Upload Driver's License or ID proof
  uploadDL: (formData, config = {}) =>
    API.post("/verification/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),

  // 🔹 Get logged-in provider’s current verification status
  getStatus: () => API.get("/verification/status"),

  // 🔹 Admin: List all pending provider verifications
  listPending: () => API.get("/verification/list"),

  // 🔹 Admin: Approve a provider verification
  approve: (id) => API.put(`/verification/${id}/approve`),

  // 🔹 Admin: Reject provider with remarks
  reject: (id, remarks) => API.put(`/verification/${id}/reject`, { remarks }),
};

export default API;
