/**
 * Toast Notification System
 * For success, error, and info messages
 */

'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={cn(
        'p-4 rounded-2xl shadow-ios-lg animate-slide-up',
        'flex items-center gap-3',
        'bg-surface dark:bg-dark-surface border border-border dark:border-dark-border',
        'max-w-full'
      )}
    >
      <span className="text-2xl flex-shrink-0">
        {type === 'success' && '✅'}
        {type === 'error' && '❌'}
        {type === 'info' && 'ℹ️'}
      </span>
      <p className="flex-1 text-sm text-text dark:text-dark-text">
        {message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-text-secondary hover:text-text transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
