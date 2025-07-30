'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icons } from '../components/icons';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-600/90 border-green-500/50 text-white';
      case 'error':
        return 'bg-red-600/90 border-red-500/50 text-white';
      case 'warning':
        return 'bg-yellow-600/90 border-yellow-500/50 text-white';
      case 'info':
        return 'bg-blue-600/90 border-blue-500/50 text-white';
      default:
        return 'bg-gray-600/90 border-gray-500/50 text-white';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Icons.CheckCircle size={20} />;
      case 'error':
        return <Icons.XCircle size={20} />;
      case 'warning':
        return <Icons.AlertTriangle size={20} />;
      case 'info':
        return <Icons.Info size={20} />;
      default:
        return <Icons.Info size={20} />;
    }
  };

  return (
    <div className={`
      ${getToastStyles()}
      backdrop-blur-md border rounded-lg p-4 min-w-[300px] max-w-[400px]
      animate-in slide-in-from-right-full duration-300
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm opacity-90 mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <Icons.X size={16} />
        </button>
      </div>
    </div>
  );
}
