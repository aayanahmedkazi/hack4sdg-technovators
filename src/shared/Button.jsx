import React from 'react';

/**
 * Large, easy-to-tap button adhering to DESIGN.md
 * Variants: primary (Teal #0B5D5E), secondary (White/Border), danger (Coral #F26B5B), ghost
 */
export function Button({
  children,
  variant = 'primary',
  size = 'default',
  icon: Icon,
  fullWidth = false,
  className = '',
  disabled = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-colors duration-150 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeStyles = {
    default: 'min-h-[46px] px-5 py-2.5 text-base gap-2.5',
    large: 'min-h-[52px] px-6 py-3.5 text-lg gap-3',
    small: 'min-h-[38px] px-3.5 py-1.5 text-sm gap-2',
  };

  const variantStyles = {
    primary: 'bg-mediteal hover:bg-mediteal-hover text-white shadow-none',
    secondary: 'bg-white hover:bg-medicard text-slate-800 border border-slate-200 shadow-none',
    danger: 'bg-medicoral hover:bg-medicoral-hover text-white shadow-none',
    ghost: 'bg-transparent hover:bg-medicard text-slate-600 hover:text-slate-900',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.default} ${variantStyles[variant] || variantStyles.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0 stroke-[2]" />}
      <span>{children}</span>
    </button>
  );
}
