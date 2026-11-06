import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent disabled:opacity-50 disabled:cursor-not-allowed select-none text-[13px]';

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs h-7 gap-1',
    sm: 'px-2.5 py-1 text-xs h-8 gap-1.5',
    md: 'px-3.5 py-1.5 text-[13px] h-9 gap-1.5',
    lg: 'px-4 py-2 text-sm h-10 gap-2',
  };

  const variantClasses = {
    primary:
      'bg-brand-accent text-white hover:bg-brand-accent-hover active:bg-[#064391]',
    secondary:
      'bg-gray-100 text-brand-text hover:bg-gray-200 border border-brand-border',
    outline:
      'border border-brand-border text-brand-text bg-white hover:bg-gray-50 active:bg-gray-100',
    ghost:
      'text-brand-muted hover:text-brand-text hover:bg-gray-100',
    danger:
      'bg-brand-error text-white hover:bg-red-700',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-1.5">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
