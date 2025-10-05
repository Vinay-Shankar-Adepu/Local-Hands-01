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
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <FiBell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 rounded-lg z-50 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm ${
                    !n.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <p className="text-gray-800 dark:text-gray-200">{n.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
