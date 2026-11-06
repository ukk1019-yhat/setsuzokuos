import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => {
  return (
    <div className={`bg-white rounded-lg border border-brand-border shadow-sm overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-brand-text">{title}</h3>}
            {subtitle && <p className="text-xs text-brand-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

