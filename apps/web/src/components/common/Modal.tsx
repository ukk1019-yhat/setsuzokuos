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
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div
          className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full ${maxWidth} border border-brand-border`}
        >
          <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-brand-text">{title}</h3>
              {subtitle && <p className="text-xs text-brand-muted mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

