import React from 'react';
import type { ToastItem } from '../../store/uiStore';
import { useUIStore } from '../../store/uiStore';

interface ToastProps {
  toast: ToastItem;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  const removeToast = useUIStore((s) => s.removeToast);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  };

  return (
    <div
      className={`toast toast-${toast.type} animate-slide-in flex items-center justify-between cursor-pointer`}
      onClick={() => removeToast(toast.id)}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon()}</span>
        <span>{toast.message}</span>
      </div>
      <button className="ml-4 opacity-70 hover:opacity-100 text-xs">✕</button>
    </div>
  );
};
