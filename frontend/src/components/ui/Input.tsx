/**
 * Input Component - Apple-inspired design
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-surface dark:bg-dark-surface',
            'border border-border dark:border-dark-border',
            'text-text dark:text-dark-text',
            'placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary',
            'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent',
            'transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-ios-red focus:ring-ios-red',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-ios-red">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1.5 text-sm text-text-secondary dark:text-dark-text-secondary">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
