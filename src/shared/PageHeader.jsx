import React from 'react';

/**
 * Standard page header with clear heading, plain-language description,
 * and an optional slot for the screen's single main action.
 */
export function PageHeader({
  title,
  subtitle,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 ${className}`}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-base text-slate-600">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
