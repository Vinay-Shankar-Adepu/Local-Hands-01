import React from "react";
import { FiMapPin, FiStar, FiClock, FiUser } from "react-icons/fi";

export default function ServiceCard({
  service,
  onBook,
  showBookButton = true,
  variant = "default",
}) {
  const { name, category, price, duration, provider, rating, image, distanceKm, description } = service;

  if (variant === "compact") {
    return (
      <div className="group bg-white dark:bg-gray-800 rounded-xl border border-brand-gray-200 dark:border-gray-700 shadow-card dark:shadow-dark-card hover:shadow-cardHover dark:hover:shadow-dark-glow hover:border-brand-primary dark:hover:border-blue-500 transition-all duration-300 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-brand-gray-900 dark:text-white text-sm mb-1 group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors duration-300">
                {name}
              </h3>
              <p className="text-xs text-brand-gray-500 dark:text-gray-400 capitalize">{category}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-brand-primary dark:text-blue-400 text-lg">₹{price}</p>
              {duration && <p className="text-xs text-brand-gray-400 dark:text-gray-500">/{duration}</p>}
            </div>
          </div>

          {distanceKm && (
            <div className="flex items-center text-xs text-brand-gray-500 dark:text-gray-400 mb-2">
              <FiMapPin className="w-3 h-3 mr-1" />
              {distanceKm.toFixed(1)} km away
            </div>
          )}

          {showBookButton && onBook && (
            <button
              onClick={() => onBook(service)}
              className="w-full mt-3 bg-brand-primary dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-glow dark:shadow-glow-blue"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl2 border border-brand-gray-200 dark:border-gray-700 shadow-card dark:shadow-dark-card hover:shadow-cardHover dark:hover:shadow-dark-glow hover:border-brand-primary dark:hover:border-blue-500 transition-all duration-300 overflow-hidden animate-fade-in transform hover:-translate-y-1">
      {/* Service Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            image ||
            `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=240&fit=crop&crop=center`
          }
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-brand-gray-700 dark:text-gray-200 backdrop-blur-sm transition-colors duration-300">
            {category}
          </span>
        </div>
        {rating && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 dark:bg-gray-800/90 rounded-full px-2 py-1 backdrop-blur-sm transition-colors duration-300">
            <FiStar className="w-3 h-3 text-warning dark:text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-brand-gray-700 dark:text-gray-200">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-brand-gray-900 dark:text-white text-lg group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors duration-300 flex-1 pr-3">
            {name}
          </h3>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-brand-primary dark:text-blue-400 text-2xl">₹{price}</p>
            {duration && <p className="text-sm text-brand-gray-400 dark:text-gray-500 whitespace-nowrap">{duration === 'service' ? 'Starting from' : `per ${duration}`}</p>}
          </div>
        </div>

        {description && (
          <p className="text-sm text-brand-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{description}</p>
        )}

        {provider && (
          <div className="flex items-center text-sm text-brand-gray-500 dark:text-gray-400 mb-2">
            <FiUser className="w-4 h-4 mr-1" />
            <span>{provider.name}</span>
            {provider.rating && (
              <>
                <span className="mx-2">•</span>
                <FiStar className="w-3 h-3 mr-1 text-warning dark:text-yellow-400" />
                <span>{provider.rating.toFixed(1)}</span>
              </>
            )}
          </div>
        )}

        {duration && duration !== 'service' && (
          <div className="flex items-center text-sm text-brand-gray-500 dark:text-gray-400 mb-1">
            <FiClock className="w-4 h-4 mr-1" />
            <span>{duration}</span>
          </div>
        )}

        {distanceKm && (
          <div className="flex items-center text-sm text-brand-gray-500 dark:text-gray-400">
            <FiMapPin className="w-4 h-4 mr-1" />
            {distanceKm.toFixed(1)} km away
          </div>
        )}

        {showBookButton && onBook && (
          <button
            onClick={() => onBook(service)}
            className="w-full mt-4 bg-gradient-to-r from-brand-primary to-blue-600 dark:from-blue-500 dark:to-blue-600 hover:from-blue-600 hover:to-brand-primary dark:hover:from-blue-600 dark:hover:to-blue-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-glow dark:shadow-glow-blue focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
}
