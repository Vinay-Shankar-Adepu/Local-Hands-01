import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiSearch } from 'react-icons/fi';
import API from '../services/api';

export default function ServiceSelectionModal({ isOpen, onClose, onComplete }) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCatalog();
    }
  }, [isOpen]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/catalog');
      setCatalog(data.catalog || []);
    } catch (err) {
      console.error('Failed to load catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (templateId) => {
    const newSelected = new Set(selected);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelected(newSelected);
  };

  const handleSubmit = async () => {
    if (selected.size === 0) {
      alert('Please select at least one service');
      return;
    }

    try {
      setSubmitting(true);
      await API.post('/providers/select-services', {
        templateIds: Array.from(selected)
      });
      onComplete?.();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add services');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCatalog = catalog.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.services.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">Select Your Services</h2>
            <p className="text-blue-100 mt-1">Choose the services you can provide to customers</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {selected.size} service{selected.size !== 1 ? 's' : ''} selected
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              No services found matching "{searchTerm}"
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map((category) => (
                <div key={category._id} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {category.name}
                    </h3>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">
                      {category.services.length}
                    </span>
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    {category.services.map((service) => {
                      const isSelected = selected.has(service._id);
                      return (
                        <motion.button
                          key={service._id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleService(service._id)}
                          className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {service.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Base ₹{service.defaultPrice}
                              </p>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}
                            >
                              {isSelected && <FiCheck className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selected.size > 0 
                ? `You can add or remove services anytime from your profile`
                : `Select at least one service to continue`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={selected.size === 0 || submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Adding...' : `Add Selected (${selected.size})`}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
