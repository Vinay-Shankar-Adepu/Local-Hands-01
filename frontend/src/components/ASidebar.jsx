import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiLayers, FiUserCheck, FiShield } from "react-icons/fi";
import { VerificationAPI } from "../services/api";
import toast from "react-hot-toast";

export default function ASidebar() {
  const [pendingCount, setPendingCount] = useState(0);
  const prevCount = useRef(0);

  // 🎵 Load notification sound (keep file in /public/sounds/notification.mp3)
  const playNotificationSound = () => {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.5; // gentle volume
    audio.play().catch(() => {
      console.warn("Notification sound blocked (autoplay restriction)");
    });
  };

  const fetchPending = async (notify = false) => {
    try {
      const { data } = await VerificationAPI.listPending();
      const currentCount = data.data?.length || 0;

      // 🔔 Notify if new requests arrived
      if (notify && currentCount > prevCount.current) {
        const diff = currentCount - prevCount.current;

        // Play soft sound
        playNotificationSound();

        toast.success(`🔔 ${diff} new verification ${diff > 1 ? "requests" : "request"} received`, {
          duration: 4000,
          position: "top-right",
          style: {
            borderRadius: "8px",
            background: "#fff",
            color: "#222",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            fontWeight: 500,
          },
        });
      }

      setPendingCount(currentCount);
      prevCount.current = currentCount;
    } catch (err) {
      console.error("Failed to fetch pending verifications");
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(() => fetchPending(true), 90000); // refresh every 1.5 minutes
    return () => clearInterval(interval);
  }, []);

  const linkBase =
    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200";

  return (
    <aside className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen w-64 flex flex-col py-6 shadow-md">
      <h2 className="text-xl font-bold text-center text-blue-600 mb-6">
        Admin Panel
      </h2>

      <nav className="flex flex-col gap-2 px-3 flex-1 overflow-auto">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800"
            }`
          }
        >
          <FiHome /> Dashboard
        </NavLink>

        <NavLink
          to="/admin/catalog"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800"
            }`
          }
        >
          <FiLayers /> Catalog
        </NavLink>

        <NavLink
          to="/admin/providers"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800"
            }`
          }
        >
          <FiUserCheck /> Providers
        </NavLink>

        {/* 🔹 Verification Requests Tile */}
        <NavLink
          to="/admin/verifications"
          className={({ isActive }) =>
            `${linkBase} relative ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800"
            }`
          }
        >
          <FiShield /> Verification Requests
          {pendingCount > 0 && (
            <span className="absolute right-4 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
              {pendingCount}
            </span>
          )}
        </NavLink>
      </nav>

      <div className="text-xs text-center text-gray-400 dark:text-gray-500 mt-auto py-4 border-t border-gray-200 dark:border-gray-700">
        © LocalHands {new Date().getFullYear()}
      </div>
    </aside>
  );
}
