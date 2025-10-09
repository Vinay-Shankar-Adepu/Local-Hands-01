import React from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

export default function VerificationStatusBadge({ status, size = 'md', showIcon = true, showText = true }) {
  const configs = {
    pending: {
      icon: FiClock,
      text: 'Pending Approval',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text_color: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-300 dark:border-yellow-700',
    },
    approved: {
      icon: FiCheckCircle,
      text: 'Verified',
      bg: 'bg-green-100 dark:bg-green-900/30',
      text_color: 'text-green-800 dark:text-green-200',
      border: 'border-green-300 dark:border-green-700',
    },
    rejected: {
      icon: FiXCircle,
      text: 'Rejected',
      bg: 'bg-red-100 dark:bg-red-900/30',
      text_color: 'text-red-800 dark:text-red-200',
      border: 'border-red-300 dark:border-red-700',
    },
    not_submitted: {
      icon: FiAlertCircle,
      text: 'Not Verified',
      bg: 'bg-gray-100 dark:bg-gray-800',
      text_color: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-300 dark:border-gray-600',
    },
  };

  const config = configs[status] || configs.not_submitted;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-2 rounded-full border
        ${config.bg} ${config.text_color} ${config.border}
        ${sizeClasses[size]}
        font-medium transition-colors
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {showText && <span>{config.text}</span>}
    </span>
  );
}
