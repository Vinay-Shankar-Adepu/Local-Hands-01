import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProviderVerification from '../components/ProviderVerification';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function ProviderVerificationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStatusChange = (newStatus) => {
    console.log('Verification status changed to:', newStatus);
    // You can update global state or trigger notifications here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/provider/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <ProviderVerification user={user} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
}
