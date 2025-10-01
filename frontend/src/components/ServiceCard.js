import React from "react";
import { FiMapPin, FiStar, FiClock, FiUser } from "react-icons/fi";

export default function ServiceCard({ service, onBook, showBookButton = true, variant = "default" }) {
  const { name, category, price, duration, provider, rating, image } = service;

  if (variant === "compact") {
    return (
      <div className="group bg-white rounded-xl border border-brand-gray-200 shadow-card hover:shadow-cardHover transition-all duration-300 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-brand-gray-900 text-sm mb-1 group-hover:text-brand-primary transition-colors duration-200">
                {name}
              </h3>
              <p className="text-xs text-brand-gray-500 capitalize">{category}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-brand-primary text-lg">₹{price}</p>
              {duration && <p className="text-xs text-brand-gray-400">/{duration}</p>}
            </div>
          </div>
          
          {showBookButton && onBook && (
            <button
              onClick={() => onBook(service)}
              className="w-full mt-3 bg-brand-primary hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-glow"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-xl2 border border-brand-gray-200 shadow-card hover:shadow-cardHover transition-all duration-300 overflow-hidden animate-fade-in transform hover:-translate-y-1">
      {/* Service Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image || `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=240&fit=crop&crop=center`}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-brand-gray-700 backdrop-blur-sm">
            {category}
          </span>
        </div>
        {rating && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1 backdrop-blur-sm">
            <FiStar className="w-3 h-3 text-warning fill-current" />
            <span className="text-xs font-medium text-brand-gray-700">{rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-brand-gray-900 text-lg mb-1 group-hover:text-brand-primary transition-colors duration-200">
              {name}
            </h3>
            
            {provider && (
              <div className="flex items-center text-sm text-brand-gray-500 mb-2">
                <FiUser className="w-4 h-4 mr-1" />
                <span>{provider.name}</span>
                {provider.rating && (
                  <>
                    <span className="mx-2">•</span>
                    <FiStar className="w-3 h-3 mr-1 text-warning" />
                    <span>{provider.rating}</span>
                  </>
                )}
              </div>
            )}
            
            {duration && (
              <div className="flex items-center text-sm text-brand-gray-500">
                <FiClock className="w-4 h-4 mr-1" />
                <span>{duration}</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <p className="font-bold text-brand-primary text-2xl">₹{price}</p>
            {duration && <p className="text-sm text-brand-gray-400">per {duration}</p>}
          </div>
        </div>

        {showBookButton && onBook && (
          <button
            onClick={() => onBook(service)}
            className="w-full mt-4 bg-gradient-to-r from-brand-primary to-blue-600 hover:from-blue-600 hover:to-brand-primary text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
}

