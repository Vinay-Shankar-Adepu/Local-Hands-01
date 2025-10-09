import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VerificationAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
  FiRefreshCw,
} from "react-icons/fi";

export default function AdminVerificationQueue() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const { data } = await VerificationAPI.listPending();
      setVerifications(data.data || []);
    } catch (err) {
      toast.error("Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (id) => {
    try {
      await VerificationAPI.approve(id);
      toast.success("✅ Verification approved");
      setSelected(null);
      loadVerifications();
    } catch {
      toast.error("Approval failed");
    }
  };

  const rejectVerification = async (id) => {
    if (!remarks.trim()) return toast.error("Please add rejection remarks.");
    try {
      await VerificationAPI.reject(id, remarks);
      toast.success("❌ Verification rejected");
      setSelected(null);
      setRemarks("");
      loadVerifications();
    } catch {
      toast.error("Rejection failed");
    }
  };

  useEffect(() => {
    loadVerifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-6 py-10 transition-colors text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FiClock className="text-blue-600" /> Pending Verifications
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review provider submissions and approve or reject accordingly.
            </p>
          </div>
          <button
            onClick={async () => {
              setRefreshing(true);
              await loadVerifications();
              setTimeout(() => setRefreshing(false), 800);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all ${
              refreshing ? "animate-spin" : ""
            }`}
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        {/* Verification List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : verifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            No pending verifications 🎉
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifications.map((v) => (
              <motion.div
                key={v._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all overflow-hidden"
              >
                <img
                  src={v.verificationDocs?.dl}
                  alt="Proof"
                  className="w-full h-56 object-cover hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-blue-500" />
                    <h3 className="font-semibold text-lg">
                      {v.user?.name || "Unknown Provider"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    <strong>Email:</strong> {v.user?.email || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Phone:</strong> {v.user?.phone || "N/A"}
                  </p>

                  <button
                    onClick={() => setSelected(v)}
                    className="w-full mt-2 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    Review
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 30 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-lg w-full relative"
              >
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>

                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <FiUser className="text-blue-500" />
                  {selected.user?.name || "Provider"}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Please verify that the uploaded image clearly shows the
                  provider’s face and their driving licence.
                </p>

                <img
                  src={selected.verificationDocs?.dl}
                  alt="Proof"
                  className="rounded-lg border mb-4 w-full object-cover"
                />

                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add remarks (required for rejection)"
                  rows="3"
                  className="w-full text-sm p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => approveVerification(selected._id)}
                    className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle /> Approve
                  </button>
                  <button
                    onClick={() => rejectVerification(selected._id)}
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <FiXCircle /> Reject
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
