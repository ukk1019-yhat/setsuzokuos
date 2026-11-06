import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'accent' | 'navy' | 'teal';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const variantStyles: Record<string, string> = {
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    accent: 'bg-blue-50 text-blue-800 border-blue-200',
    // Backwards compatibility mappings
    navy: 'bg-gray-100 text-gray-800 border-gray-300',
    teal: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[11px] font-medium leading-tight',
    md: 'px-2 py-0.5 text-xs font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded border ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
