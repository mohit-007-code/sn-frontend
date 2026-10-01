import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import type { ToastType } from '../../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-start gap-3 p-4 bg-zinc-950 text-white border border-zinc-800 rounded-lg shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in duration-200 transition-all"
        >
          {getIcon(toast.type)}
          <div className="flex-1 text-sm font-medium leading-5 text-zinc-100 break-words">
            {toast.message}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="p-1 -mr-1 -mt-1 text-zinc-400 hover:text-white rounded transition-colors focus:outline-none focus:ring-1 focus:ring-white"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
