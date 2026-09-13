import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

let toastListeners: ((toast: ToastData) => void)[] = [];

export function showToast(toast: Omit<ToastData, 'id'>) {
  const t = { ...toast, id: `toast_${Date.now()}` };
  toastListeners.forEach(fn => fn(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const listener = (toast: ToastData) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 4000);
    };
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter(l => l !== listener); };
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success-500" />,
    error: <XCircle className="w-5 h-5 text-danger-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning-500" />,
    info: <Info className="w-5 h-5 text-primary-500" />,
  };

  const borderColors = {
    success: 'border-l-success-500',
    error: 'border-l-danger-500',
    warning: 'border-l-warning-500',
    info: 'border-l-primary-500',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto bg-white rounded-xl shadow-xl border border-gray-100 border-l-4 ${borderColors[toast.type]} px-4 py-3 min-w-[320px] max-w-[420px] animate-slideInRight flex items-start gap-3`}
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
            {toast.message && <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>}
          </div>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
