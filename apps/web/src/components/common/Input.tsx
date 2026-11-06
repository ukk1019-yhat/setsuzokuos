import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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
            className="block text-xs font-semibold text-brand-text mb-1 tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2 text-sm bg-white border rounded-md shadow-sm transition-colors text-brand-text placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal ${
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

