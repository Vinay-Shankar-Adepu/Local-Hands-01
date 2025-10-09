import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import VerificationStatusBadge from './VerificationStatusBadge';

export default function VerificationBanner({ status, rejectionReason }) {
  const navigate = useNavigate();

  if (status === 'approved') {
    return null; // Don't show banner if approved
  }

  const configs = {
    not_submitted: {
      icon: FiAlertCircle,
      title: 'Verification Required',
      message: 'You need to verify your license before you can go live and accept bookings.',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      buttonText: 'Upload License Now',
    },
    pending: {
      icon: FiAlertCircle,
      title: 'Verification Pending',
      message: 'Your license is under review. You\'ll be able to go live once admin approves it.',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      buttonText: 'View Status',
    },
    rejected: {
      icon: FiXCircle,
      title: 'Verification Rejected',
      message: rejectionReason || 'Your verification was rejected. Please resubmit with valid documents.',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      buttonText: 'Resubmit License',
    },
  };

  const config = configs[status] || configs.not_submitted;
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border-l-4 p-4 mb-6 rounded-r-lg`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${config.textColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${config.textColor} mb-1`}>
            {config.title}
          </h3>
          <p className={`text-sm ${config.textColor} opacity-90 mb-3`}>
            {config.message}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <VerificationStatusBadge status={status} size="sm" />
            <button
              onClick={() => navigate('/provider/verification')}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                bg-white dark:bg-gray-800 shadow-sm hover:shadow-md
                ${config.textColor} border ${config.borderColor}
                transition-all duration-200 hover:scale-105
              `}
            >
              {config.buttonText}
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
