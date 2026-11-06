import React, { ReactNode } from 'react';
import { Logo } from '../common/Logo';
import { Mail } from 'lucide-react';

export const AuthLayout: React.FC<{ children: ReactNode; title?: string; subtitle?: string }> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Logo size="lg" showSubtitle={true} />
        </div>

        {title && (
          <h2 className="mt-4 text-xl font-bold text-brand-navy">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-1 text-xs text-brand-muted">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-brand-border rounded-xl sm:px-10">
          {children}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-brand-muted space-y-1">
        <div>
          Direct Enterprise Desk:{' '}
          <a href="mailto:info@setsuzoku.in" className="text-brand-teal font-semibold hover:underline inline-flex items-center gap-1">
            <Mail className="w-3 h-3" />
            info@setsuzoku.in
          </a>
        </div>
        <div className="text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} SETSUZOKU OS &bull; Unified Agency Operating System
        </div>
      </div>
    </div>
  );
};

