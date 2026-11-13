import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4 text-center">
        <div
          className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div
          className={`relative transform overflow-hidden rounded-t-xl sm:rounded-lg bg-white text-left shadow-xl transition-all w-full ${maxWidth} border border-brand-border max-h-[92vh] flex flex-col`}
        >
          <div className="flex items-center justify-between border-b border-brand-border px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0">
            <div className="pr-2 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-brand-text truncate">{title}</h3>
              {subtitle && <p className="text-[11px] sm:text-xs text-brand-muted mt-0.5 truncate">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

