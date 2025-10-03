import React from 'react';
import { FiCalendar, FiUser, FiPhone, FiMapPin, FiStar } from 'react-icons/fi';

/**
 * Reusable booking card component with consistent styling
 */
export default function BookingCard({ 
  booking, 
  actions, 
  onCustomerClick,
  compact = false 
}) {
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    if (booking.providerOfferStatus === 'declined') {
      return <span className="badge-error">Declined</span>;
    }
    
    switch (booking.status) {
      case 'requested':
        return <span className="badge-warning">Pending</span>;
      case 'accepted':
        return <span className="badge-success">Accepted</span>;
      case 'completed':
        return <span className="badge">Completed</span>;
      case 'rejected':
        return <span className="badge-error">Rejected</span>;
      case 'cancelled':
        return <span className="badge">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="card p-5 hover:shadow-cardHover transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Booking Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-semibold text-brand-gray-900 dark:text-gray-100">
              #{booking.bookingId}
            </h3>
            {getStatusBadge()}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-brand-gray-700 dark:text-gray-300">
              {booking.serviceTemplate?.name || booking.service?.name}
            </p>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-gray-500 dark:text-gray-400">
              {booking.scheduledAt && (
                <span className="inline-flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" />
                  {formatDate(booking.scheduledAt)}
                </span>
              )}
              
              {booking.customer && (
                <span className="inline-flex items-center gap-1">
                  <FiUser className="w-3 h-3" />
                  {booking.customer.name}
                  {onCustomerClick && (
                    <button
                      onClick={onCustomerClick}
                      className="ml-1 text-brand-primary dark:text-blue-400 hover:underline"
                    >
                      View
                    </button>
                  )}
                </span>
              )}
              
              {booking.provider && (
                <span className="inline-flex items-center gap-1">
                  <FiUser className="w-3 h-3" />
                  Provider: {booking.provider.name}
                </span>
              )}
            </div>
          </div>

          {!compact && booking.customer && (
            <div className="mt-2 space-y-1 text-xs text-brand-gray-600 dark:text-gray-400">
              {booking.customer.phone && (
                <p className="flex items-center gap-1">
                  <FiPhone className="w-3 h-3" />
                  {booking.customer.phone}
                </p>
              )}
              {booking.customer.address && (
                <p className="flex items-center gap-1">
                  <FiMapPin className="w-3 h-3" />
                  {booking.customer.address}
                </p>
              )}
              {booking.customer.rating > 0 && (
                <p className="flex items-center gap-1">
                  <FiStar className="w-3 h-3 text-yellow-500" />
                  {booking.customer.rating.toFixed(1)} ({booking.customer.ratingCount || 0} reviews)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex gap-2 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
