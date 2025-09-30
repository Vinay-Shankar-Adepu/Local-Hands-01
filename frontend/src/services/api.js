import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:5000/api",
});

// 🔹 Attach token on every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("lh_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// 🔹 Handle expired token globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("lh_token");
      localStorage.removeItem("lh_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const get = (url, config = {}) => API.get(url, config);
export const post = (url, data, config = {}) => API.post(url, data, config);
export const put = (url, data, config = {}) => API.put(url, data, config);
export const del = (url, config = {}) => API.delete(url, config);

// Domain specific helpers (optional convenience)
export const BookingAPI = {
  create: (payload) => API.post("/bookings/create", payload),
  mine: () => API.get("/bookings/mine"),
  accept: (id) => API.patch(`/bookings/${id}/accept`),
  reject: (id, reason="") => API.patch(`/bookings/${id}/reject`, { reason }),
};

export const ServiceAPI = {
  list: () => API.get("/services"),
  mine: () => API.get("/services/mine"),
};

export const UserAPI = {
  me: () => API.get('/users/me'),
  updateMe: (payload) => API.patch('/users/me', payload)
};

export default API;
