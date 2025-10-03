import React, { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import API from "../services/api";

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      loadNotifications();
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-brand-gray-100 transition-colors"
      >
        <FiBell className="w-5 h-5 text-brand-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-brand-gray-200 shadow-lg rounded-lg z-50 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-2 border-b border-brand-gray-100">
            <h3 className="font-semibold text-brand-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-brand-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-brand-gray-500 p-4 text-center">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-brand-gray-100 text-sm ${
                    !n.read ? "bg-brand-primary/5" : ""
                  }`}
                >
                  <p className="text-brand-gray-800">{n.message}</p>
                  <p className="text-xs text-brand-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
