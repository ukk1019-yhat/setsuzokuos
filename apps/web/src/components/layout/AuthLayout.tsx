import React, { ReactNode } from 'react';
import { Layers } from 'lucide-react';

export const AuthLayout: React.FC<{ children: ReactNode; title?: string; subtitle?: string }> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-navy text-brand-teal shadow-md mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-navy">SETSUZOKU OS</h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-brand-teal font-semibold">
          From First Inquiry to Final Payment
        </p>

        {title && (
          <h2 className="mt-6 text-xl font-semibold text-brand-text">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-brand-muted">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-brand-border rounded-xl sm:px-10">
          {children}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-brand-muted">
        &copy; {new Date().getFullYear()} SETSUZOKU OS. Unified Business Operations Platform.
      </div>
    </div>
  );
};

