import React from 'react';

/**
 * Minimalist card adhering to DESIGN.md
 * Background: #F6F8F8 (medicard), subtle border, rounded corners, generous spacing, no heavy shadow
 */
export function Card({
  children,
  className = '',
  highlight = false,
  alert = false,
  as: Component = 'div',
  ...props
}) {
  const borderStyle = alert
    ? 'border-medicoral/40 bg-medicoral-light/30'
    : highlight
    ? 'border-mediteal/30 bg-medicard'
    : 'border-slate-200/80 bg-medicard';

  return (
    <Component
      className={`rounded-2xl border ${borderStyle} p-6 sm:p-7 transition-colors ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
