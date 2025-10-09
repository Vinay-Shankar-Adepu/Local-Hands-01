import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUploadCloud,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import { VerificationAPI } from "../services/api";
import toast from "react-hot-toast";

export default function ProviderVerification() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [preview, setPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 🔁 Fetch current verification status
  const fetchStatus = async () => {
    try {
      const { data } = await VerificationAPI.getStatus();
      const userData = data?.data || {};
      setStatus(userData.verificationStatus || "not_submitted");
      setPreview(userData.verificationDocs?.dl || "");
      setRemarks(userData.verificationRemarks || "");
    } catch (err) {
      console.error("Error fetching verification status:", err);
      toast.error("Unable to fetch verification status.");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // 📸 Handle file input
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  // ⬆️ Handle upload with progress bar
  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file first!");
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("dlImage", file);

    try {
      await VerificationAPI.uploadDL(formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      toast.success("✅ Document uploaded successfully! Waiting for admin approval.");
      setIsUploading(false);
      setFile(null);
      fetchStatus();
    } catch (err) {
      console.error("Upload failed:", err);
      setIsUploading(false);
      toast.error("Upload failed. Please try again.");
    }
  };

  // 🎯 Render verification status badge
  const getStatusBadge = () => {
    switch (status) {
      case "verified":
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-2 rounded-full shadow-sm">
            <FiCheckCircle className="text-xl" />
            <span className="font-semibold">Verified</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-100 px-3 py-2 rounded-full animate-pulse shadow-sm">
            <FiClock className="text-xl" />
            <span className="font-semibold">Pending Review</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-2 rounded-full shadow-sm">
            <FiXCircle className="text-xl" />
            <span className="font-semibold">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-2 rounded-full shadow-sm">
            <FiAlertCircle className="text-xl" />
            <span className="font-semibold">Not Submitted</span>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-12"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
          Provider Verification
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
          Verify your identity to activate your account and start providing services.
        </p>

        <div className="flex justify-center mb-4">{getStatusBadge()}</div>

        {/* 📝 Show admin remarks if rejected */}
        {remarks && status === "rejected" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 text-sm rounded-lg mb-4 border border-red-200 dark:border-red-700"
          >
            <strong>Admin Remarks:</strong> {remarks}
          </motion.div>
        )}

        {/* 📄 Preview uploaded or selected file */}
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Uploaded Document:
            </p>
            <img
              src={preview}
              alt="DL Preview"
              className="rounded-lg shadow-lg w-full h-64 object-cover border border-gray-200 dark:border-gray-700 hover:scale-[1.02] transition-transform duration-300"
            />
          </motion.div>
        )}

        {/* 📤 Upload Section */}
        {status !== "verified" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 rounded-xl text-center mb-4 hover:border-blue-500 transition-all duration-300 bg-gray-50 dark:bg-gray-800/50"
          >
            <FiUploadCloud className="mx-auto text-5xl text-gray-400 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              Upload a clear image of your Driver’s License (JPG/PNG)
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 dark:text-gray-300 mb-3 cursor-pointer"
            />

            {/* Upload progress bar */}
            {isUploading && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                  className="h-2 bg-blue-600"
                />
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`w-full px-6 py-2 rounded-lg text-white font-semibold shadow-md transition-all duration-300 ${
                isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isUploading ? "Uploading..." : "Submit for Verification"}
            </button>
          </motion.div>
        )}

        {/* ℹ️ Status messages */}
        {status === "pending" && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
            Your verification is under review. You’ll be notified once approved.
          </p>
        )}
        {status === "verified" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-6"
          >
            <p className="text-green-600 dark:text-green-400 font-semibold text-lg mb-2">
              ✅ Your profile is verified!
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              You can now go live and accept service requests.
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
