import API from "./api";

// ---- Ratings ----
export const RatingsAPI = {
  // POST /ratings/provider  { bookingId, rating, comment?, optionalMessage?, workImages? }
  rateProvider: (payload) => {
    const { workImages, ...rest } = payload || {};
    const MAX_FILES = 5;
    const MAX_MB = 5;
    // If images present and are data URLs, send multipart
    if (workImages && Array.isArray(workImages) && workImages.length) {
      if (workImages.length > MAX_FILES) {
        return Promise.reject(new Error(`Too many images (max ${MAX_FILES})`));
      }
      const form = new FormData();
      Object.entries(rest).forEach(([k,v])=> form.append(k, v));
      // Convert each base64 data URL to Blob
      workImages.forEach((img, i) => {
        if (typeof img === 'string' && img.startsWith('data:')) {
          const [meta, b64] = img.split(',');
          try {
            const mime = meta.match(/data:(.*);base64/)[1];
            const bin = atob(b64);
            const bytes = new Uint8Array(bin.length);
            for (let j=0;j<bin.length;j++) bytes[j]=bin.charCodeAt(j);
            const sizeMb = (bytes.length / (1024*1024));
            if (sizeMb > MAX_MB) throw new Error(`Image ${i+1} exceeds ${MAX_MB}MB`);
            const blob = new Blob([bytes], { type: mime });
            form.append('images', blob, `work-${i}.${mime.split('/')[1]||'png'}`);
          } catch (err) { 
            console.warn('Image conversion failed or too large', err);
            // Fallback: skip oversized or bad images
          }
        } else {
          form.append('images', img);
        }
      });
      return API.post('/ratings/provider', form, { headers: { 'Content-Type': 'multipart/form-data' }});
    }
    return API.post('/ratings/provider', payload);
  },
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

// ---- Auth (extended) ----
export const PasswordResetAPI = {
  request: (email) => API.post('/auth/forgot-password/request', { email }),
  verify: (email, otp) => API.post('/auth/forgot-password/verify', { email, otp }),
  reset: (email, otp, newPassword) => API.post('/auth/forgot-password/reset', { email, otp, newPassword }),
};
