import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiUsers, FiSearch, FiRefreshCw } from 'react-icons/fi';
import API from '../services/api';
import VerificationStatusBadge from '../components/VerificationStatusBadge';
import LicenseReviewModal from '../components/LicenseReviewModal';

export default function AdminVerificationsPage() {
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const { data } = await API.get('/admin/verifications/stats');
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch providers based on tab
  const fetchProviders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/verifications/${activeTab}`);
      setProviders(data.providers || []);
    } catch (err) {
      console.error('Failed to fetch providers:', err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [activeTab]);

  // Filter providers based on search
  const filteredProviders = providers.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery)
  );

  // Handle action (approve/reject)
  const handleAction = (action, providerId) => {
    // Refresh both stats and list
    fetchStats();
    fetchProviders();
  };

  // Open modal
  const openModal = (provider) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedProvider(null);
  };

  const tabs = [
    { id: 'pending', label: 'Pending', icon: FiClock, count: stats.pending, color: 'yellow' },
    { id: 'approved', label: 'Approved', icon: FiCheckCircle, count: stats.approved, color: 'green' },
    { id: 'rejected', label: 'Rejected', icon: FiXCircle, count: stats.rejected, color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Provider Verifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve provider license submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Providers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <FiUsers className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          {tabs.map((tab) => (
            <div key={tab.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{tab.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{tab.count}</p>
                </div>
                <tab.icon className={`w-10 h-10 text-${tab.color}-500`} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-semibold
                    ${activeTab === tab.id
                      ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search & Refresh */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchProviders}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Providers List */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No providers found matching your search' : `No ${activeTab} providers`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider._id}
                    onClick={() => openModal(provider)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {provider.name}
                          </h3>
                          <VerificationStatusBadge status={provider.onboardingStatus} size="sm" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Email:</span> {provider.email}
                          </div>
                          {provider.phone && (
                            <div>
                              <span className="font-medium">Phone:</span> {provider.phone}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">License:</span>{' '}
                            <span className="capitalize">{provider.licenseType?.replace('_', ' ') || 'N/A'}</span>
                          </div>
                        </div>

                        {provider.verificationSubmittedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Submitted: {new Date(provider.verificationSubmittedAt).toLocaleString()}
                          </p>
                        )}

                        {provider.rejectionReason && (
                          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                            <span className="font-medium">Rejection Reason:</span> {provider.rejectionReason}
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <LicenseReviewModal
          provider={selectedProvider}
          onClose={closeModal}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
