import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-brand-text mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-1.5 text-[13px] bg-white border rounded transition-colors text-brand-text placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent ${
            error ? 'border-brand-error focus:ring-brand-error focus:border-brand-error' : 'border-brand-border'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-brand-error">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-brand-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
