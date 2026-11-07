import React, { ReactNode } from 'react';
import { Logo } from '../common/Logo';
import { Mail, ExternalLink } from 'lucide-react';

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

      <div className="mt-8 text-center text-xs text-brand-muted space-y-2">
        <div className="flex items-center justify-center gap-3 text-[12px]">
          <a
            href="https://setsuzoku.info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-brand-navy hover:underline inline-flex items-center gap-1 font-medium transition"
          >
            setsuzoku.info
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
          <span className="text-slate-300">&bull;</span>
          <a
            href="mailto:info@setsuzoku.in"
            className="text-slate-600 hover:text-brand-navy hover:underline inline-flex items-center gap-1 font-medium transition"
          >
            <Mail className="w-3 h-3 text-slate-400" />
            info@setsuzoku.in
          </a>
        </div>
        <div className="text-[11px] text-slate-400">
          &copy; 2026 Setsuzoku Media Labs. All rights reserved.
        </div>
      </div>
    </div>
  );
};

