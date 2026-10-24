import React from 'react';

/**
 * Calm status badge for tokens, medicines, and records.
 * Follows DESIGN.md color palette: Teal for active/ready, Coral for alerts only, Neutral for waiting.
 */
export function StatusBadge({
  children,
  variant = 'neutral',
  className = '',
}) {
  const variantStyles = {
    teal: 'bg-mediteal-light text-mediteal border-mediteal/20',
    coral: 'bg-medicoral-light text-medicoral border-medicoral/25',
    neutral: 'bg-white text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border uppercase select-none ${
        variantStyles[variant] || variantStyles.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}
