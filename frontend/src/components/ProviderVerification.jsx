import React, { useState, useEffect } from 'react';
import { FiUpload, FiCheck, FiX, FiAlertCircle, FiImage } from 'react-icons/fi';
import API from '../services/api';
import VerificationStatusBadge from './VerificationStatusBadge';

export default function ProviderVerification({ user, onStatusChange }) {
  const [status, setStatus] = useState(user?.onboardingStatus || 'not_submitted');
  const [licenseType, setLicenseType] = useState('aadhar');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseImage, setLicenseImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationData, setVerificationData] = useState(null);

  // Fetch current verification status
  const fetchStatus = async () => {
    try {
      const { data } = await API.get('/providers/verification-status');
      setVerificationData(data);
      setStatus(data.onboardingStatus || 'not_submitted');
      if (data.licenseImage) {
        setLicenseImage(data.licenseImage);
        setImagePreview(data.licenseImage);
      }
      if (data.licenseType) setLicenseType(data.licenseType);
      if (data.licenseNumber) setLicenseNumber(data.licenseNumber);
    } catch (err) {
      console.error('Failed to fetch verification status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload to backend (which uploads to Cloudinary)
  const uploadImage = async () => {
    if (!imageFile) {
      setError('Please select an image first');
      return null;
    }

    setUploading(true);
    setError('');

    try {
      // Upload via backend (secure and recommended)
      const formData = new FormData();
      formData.append('license', imageFile);
      
      const { data } = await API.post('/upload/license', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return data.url;

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Upload failed';
      setError('Failed to upload image: ' + errorMsg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Submit verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    if (!licenseType) {
      setError('Please select license type');
      return;
    }

    if (!licenseImage && !imageFile) {
      setError('Please upload your license image');
      return;
    }

    setSubmitting(true);

    try {
      // Upload image if new file selected
      let imageUrl = licenseImage;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          setSubmitting(false);
          return;
        }
      }

      // Submit verification
      const { data } = await API.post('/providers/submit-verification', {
        licenseImage: imageUrl,
        licenseType,
        licenseNumber: licenseNumber.trim() || undefined,
      });

      setSuccess('License submitted successfully! Waiting for admin approval.');
      setStatus('pending');
      setVerificationData(data.user);
      setImageFile(null);
      
      // Notify parent component
      if (onStatusChange) {
        onStatusChange('pending');
      }

      // Refresh status after 2 seconds
      setTimeout(fetchStatus, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  // Render different views based on status
  const renderContent = () => {
    switch (status) {
      case 'approved':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Verification Approved!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your license has been verified. You can now go live and start accepting bookings.
            </p>
            <VerificationStatusBadge status="approved" size="lg" />
            
            {verificationData?.licenseImage && (
              <div className="mt-6">
                <img
                  src={verificationData.licenseImage}
                  alt="Verified License"
                  className="max-w-xs mx-auto rounded-lg border-2 border-green-500 shadow-md"
                />
              </div>
            )}
          </div>
        );

      case 'pending':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
              <FiAlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Verification Pending
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your license is under review. Admin will approve it shortly.
            </p>
            <VerificationStatusBadge status="pending" size="lg" />
            
            {verificationData?.verificationSubmittedAt && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Submitted on {new Date(verificationData.verificationSubmittedAt).toLocaleString()}
              </p>
            )}

            {verificationData?.licenseImage && (
              <div className="mt-6">
                <img
                  src={verificationData.licenseImage}
                  alt="Submitted License"
                  className="max-w-xs mx-auto rounded-lg border shadow-md"
                />
              </div>
            )}
          </div>
        );

      case 'rejected':
        return (
          <div>
            <div className="text-center py-8 mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <FiX className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verification Rejected
              </h3>
              {verificationData?.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mx-auto mb-4">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Reason: {verificationData.rejectionReason}
                  </p>
                </div>
              )}
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please upload a valid license and try again.
              </p>
            </div>
            
            {/* Show form to resubmit */}
            {renderForm()}
          </div>
        );

      default:
        return renderForm();
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          License Type *
        </label>
        <select
          value={licenseType}
          onChange={(e) => setLicenseType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="aadhar">Aadhar Card</option>
          <option value="pan">PAN Card</option>
          <option value="driving_license">Driving License</option>
          <option value="other">Other Government ID</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          License Number (Optional)
        </label>
        <input
          type="text"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          placeholder="e.g., 1234-5678-9012"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload License Image *
        </label>
        
        <div className="mt-2">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="License preview"
                  className="max-h-40 rounded-lg"
                />
              ) : (
                <>
                  <FiImage className="w-12 h-12 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, JPEG (MAX. 5MB)
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg flex items-start gap-2">
          <FiX className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg flex items-start gap-2">
          <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {(submitting || uploading) ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {uploading ? 'Uploading...' : 'Submitting...'}
          </>
        ) : (
          <>
            <FiUpload className="w-5 h-5" />
            {status === 'rejected' ? 'Resubmit License' : 'Submit for Verification'}
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Your license will be reviewed by admin. You'll be notified once approved.
      </p>
    </form>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          License Verification
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Submit your government ID for verification to start accepting bookings
        </p>
      </div>

      {renderContent()}
    </div>
  );
}
