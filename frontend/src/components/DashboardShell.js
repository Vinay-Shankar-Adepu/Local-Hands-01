import React from 'react';

/**
 * Reusable dashboard layout wrapper
 * Provides consistent header, spacing, and action placement
 */
export default function DashboardShell({ 
  title, 
  subtitle, 
  actions, 
  children,
  className = '' 
}) {
  return (
    <div className={`section py-10 space-y-8 ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-brand-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-brand-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </header>
      {children}
    </div>
  );
}
