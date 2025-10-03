import API from "./api";

// ---- Ratings ----
export const RatingsAPI = {
  // POST /ratings/provider  { bookingId, rating, comment? }
  rateProvider: (payload) => API.post("/ratings/provider", payload),
  // POST /ratings/customer  { bookingId, rating, comment? }
  rateCustomer: (payload) => API.post("/ratings/customer", payload),
  // GET /ratings/summary?userId=...
  summary: (userId) => API.get(`/ratings/summary`, { params: { userId } }),
};

// ---- Notifications ----
export const NotificationsAPI = {
  // GET /notifications?unreadOnly=true
  list: (params = {}) => API.get("/notifications", { params }),
  // PATCH /notifications/:id/read
  markRead: (id) => API.patch(`/notifications/${id}/read`),
  // PATCH /notifications/read-all
  markAllRead: () => API.patch("/notifications/read-all"),
};
