import React, { ReactNode } from 'react';

export interface CardProps {
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
    <div className={`bg-white rounded border border-brand-border overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between">
          <div>
            {title && <h3 className="text-[13px] font-semibold text-brand-text">{title}</h3>}
            {subtitle && <p className="text-xs text-brand-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
