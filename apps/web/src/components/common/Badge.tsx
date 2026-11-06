import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'navy' | 'teal' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  const variantStyles = {
    navy: 'bg-[#142B3A]/10 text-[#142B3A] border-[#142B3A]/20',
    teal: 'bg-[#13A89E]/10 text-[#0E8B83] border-[#13A89E]/30',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

