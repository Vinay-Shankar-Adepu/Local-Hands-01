import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import API, { VerificationAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  FiClock,
  FiZap,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import ServiceSelectionModal from "../components/ServiceSelectionModal";
import { useNavigate } from "react-router-dom";

export default function ProviderDashboard() {
  const [status, setStatus] = useState("not_submitted");
  const [remarks, setRemarks] = useState("");
  const [offers, setOffers] = useState([]);
  const [now, setNow] = useState(Date.now());
  const pollRef = useRef(null);
  const verifyInterval = useRef(null);

  const { theme, setTheme } = useTheme();
  const { user, setAvailability } = useAuth();
  const navigate = useNavigate();

  // 🔊 sound notification
  const playNotificationSound = () => {
    const a = new Audio("/sounds/notification.mp3");
    a.volume = 0.5;
    a.play().catch(() => {});
  };

  // 🧭 Force offline if not verified
  const forceOfflineIfUnverified = async () => {
    if (user?.isAvailable && status !== "verified") {
      try {
        await setAvailability(false);
        toast.error("⚠️ Verification required — you were set offline.");
      } catch {
        toast.error("Unable to update availability state.");
      }
    }
  };

  // 🔁 Fetch verification status
  const fetchVerificationStatus = async (silent = false) => {
    try {
      const { data } = await VerificationAPI.getStatus();
      const info = data?.data || {};
      const newStatus = info.verificationStatus || "not_submitted";
      setStatus(newStatus);
      setRemarks(info.verificationRemarks || "");
      if (newStatus !== "verified") forceOfflineIfUnverified();
      else if (!silent) toast.success("✅ Verification status synced.");
    } catch {
      setStatus("not_submitted");
      forceOfflineIfUnverified();
    }
  };

  // 🎯 Fetch offers
  const fetchOffers = async (notify = false) => {
    try {
      const { data } = await API.get("/bookings/offers/mine");
      const list = data.offers || [];
      setOffers(list);
      setNow(Date.parse(data.now) || Date.now());
      if (notify) playNotificationSound();
    } catch {
      toast.error("Failed to fetch offers");
    }
  };

  // 🧠 Mount logic
  useEffect(() => {
    fetchOffers();
    fetchVerificationStatus(true);

    pollRef.current = setInterval(() => fetchOffers(true), 15000);
    verifyInterval.current = setInterval(() => fetchVerificationStatus(true), 30000);
    const tick = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      clearInterval(pollRef.current);
      clearInterval(verifyInterval.current);
      clearInterval(tick);
    };
  }, []);

  // 🧩 Badge helper
  const getStatusBadge = () => {
    switch (status) {
      case "verified":
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
            <FiCheckCircle /> Verified
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-100 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm animate-pulse">
            <FiClock /> Pending Review
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
            <FiXCircle /> Rejected
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
            <FiAlertCircle /> Not Submitted
          </div>
        );
    }
  };

  const canGoLive = status === "verified";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-6 py-10"
    >
      {/* ⚠️ Verification Notice */}
      {user?.role === "provider" && status !== "verified" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 p-6 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 dark:bg-amber-900/30 shadow-sm"
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-amber-700 dark:text-amber-300">
              Verification Required
            </h2>
            {getStatusBadge()}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Please upload your <strong>selfie holding your driving licence</strong> on
            the verification page. You must complete verification before going live.
          </p>

          {status === "rejected" && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              <strong>Admin Remarks:</strong> {remarks || "No remarks provided."}
            </p>
          )}

          <button
            onClick={() => navigate("/provider/verification")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition"
          >
            Go to Verification Page
          </button>
        </motion.div>
      )}

      {/* 🔘 Go Live Button */}
      {user?.role === "provider" && (
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          disabled={!canGoLive}
          onClick={async () => {
            if (!canGoLive) {
              toast.error("You must complete verification before going live!");
              return;
            }
            try {
              if (!user.isAvailable) {
                navigator.geolocation.getCurrentPosition(
                  async (p) => {
                    await setAvailability(true, {
                      lat: p.coords.latitude,
                      lng: p.coords.longitude,
                    });
                    toast.success("You are now LIVE!");
                  },
                  () => {
                    toast.error("Enable location services");
                  }
                );
              } else {
                await setAvailability(false);
                toast("You are now offline", { icon: "🔕" });
              }
            } catch {
              toast.error("Status update failed");
            }
          }}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
            canGoLive
              ? user?.isAvailable
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          {user?.isAvailable ? (
            <>
              <FiZap className="inline mr-1" /> Live
            </>
          ) : (
            <>
              Go Live <FiZap className="inline ml-1" />
            </>
          )}
        </motion.button>
      )}

      {/* 🔜 Add your services and offers section here */}
    </motion.div>
  );
}
