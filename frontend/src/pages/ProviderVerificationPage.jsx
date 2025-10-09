import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { VerificationAPI } from "../services/api"; // ✅ use correct API

export default function ProviderVerificationPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("dlImage", selectedFile); // ✅ must match backend

      const res = await VerificationAPI.uploadDL(formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
        },
      });

      if (res.status === 200) {
        toast.success("✅ Verification uploaded successfully!");
        navigate("/provider");
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Provider Verification
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          Please upload a <strong>selfie holding your Driving Licence</strong>.
          Verification is mandatory to go live.
        </p>

        {/* 🪪 Demo Instruction Image */}
        <img
          src="/demo/selfie_dl_sample.jpg"
          alt="Demo Selfie Example"
          className="w-full max-w-xs mx-auto mb-5 rounded-lg border shadow-sm"
        />

        <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
          />
          {selectedFile && (
            <p className="text-sm text-gray-500">
              Selected file:{" "}
              <span className="font-medium">{selectedFile.name}</span>
            </p>
          )}
        </div>

        {isUploading && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4 mb-3 overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-2 bg-blue-600"
            />
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`mt-6 w-full py-2 rounded-lg font-semibold text-white transition ${
            isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload & Verify"}
        </button>

        <button
          onClick={() => navigate("/provider")}
          className="mt-4 w-full py-2 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </motion.div>
  );
}
