import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProviderVerification from '../components/ProviderVerification';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import API from '../services/api';

export default function ProviderVerificationPage() {
  const { user, saveSession } = useAuth();
  const navigate = useNavigate();

  const handleStatusChange = async (newStatus) => {
    console.log('Verification status changed to:', newStatus);
    
    // ✅ Refresh user data from backend to update AuthContext
    try {
      const { data } = await API.get('/users/me');
      saveSession(null, { ...user, ...data.user });
      console.log('User data refreshed in AuthContext');
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
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
