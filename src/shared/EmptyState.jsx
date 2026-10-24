import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

/**
 * Clean empty state for lists and cards when there is no data yet.
 * Explains in simple plain words with an optional main action.
 */
export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <Card className={`text-center py-12 px-6 flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-mediteal mb-4">
          <Icon className="w-7 h-7 stroke-[1.75]" />
        </div>
      )}
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
        {title}
      </h3>
      <p className="text-base text-slate-600 max-w-md mx-auto mb-6">
        {message}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
