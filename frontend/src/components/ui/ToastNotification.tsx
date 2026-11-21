import React, { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  statusBadge?: 'Approved' | 'Rejected' | 'Pending' | string;
  timestamp?: string;
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'bottom-right';
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
}) => {
  if (toasts.length === 0) return null;

  const positionClass =
    position === 'bottom-right'
      ? 'fixed bottom-6 right-6 z-[9999]'
      : 'fixed top-20 right-6 z-[9999]';

  return (
    <div
      className={`${positionClass} flex flex-col gap-3 pointer-events-none`}
      style={{ fontFamily: "'Inter', sans-serif" }}
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        let iconEl = <Info size={18} className="text-blue-600 stroke-[2]" />;
        let iconBoxBg = 'bg-[#EFF6FF] border-[#BFDBFE] text-blue-600';

        if (toast.type === 'success' || toast.statusBadge === 'Approved' || toast.statusBadge === 'Paid') {
          iconEl = <CheckCircle2 size={18} className="text-[#16A34A] stroke-[2]" />;
          iconBoxBg = 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]';
        } else if (toast.type === 'error' || toast.statusBadge === 'Rejected' || toast.statusBadge === 'Overdue') {
          iconEl = <XCircle size={18} className="text-[#E11D48] stroke-[2]" />;
          iconBoxBg = 'bg-[#FEF2F2] border-[#FECACA] text-[#E11D48]';
        } else if (toast.type === 'warning' || toast.statusBadge === 'Pending' || toast.statusBadge === 'Due Soon') {
          iconEl = <Clock size={18} className="text-[#D97706] stroke-[2]" />;
          iconBoxBg = 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]';
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-slate-200/90 rounded-2xl shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12),0_4px_16px_-2px_rgba(0,0,0,0.06)] p-3.5 pl-4 pr-3.5 flex items-center gap-3.5 min-w-[320px] max-w-md animate-in slide-in-from-top-3 fade-in duration-200 transition-all"
            style={{
              boxShadow: '0 12px 36px -6px rgba(15, 23, 42, 0.12), 0 4px 16px -2px rgba(15, 23, 42, 0.06)',
            }}
          >
            {/* Semantic Status Icon Box */}
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBoxBg}`}
              style={{ flexShrink: 0 }}
            >
              {iconEl}
            </div>

            {/* Content Text */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-[14px] font-semibold text-slate-900 leading-[20px] tracking-tight">
                {toast.title}
              </span>
              {toast.message && (
                <span className="text-[12px] font-normal text-slate-500 leading-[18px] mt-0.5 truncate">
                  {toast.message}
                </span>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0 cursor-pointer self-start -mt-0.5 -mr-0.5"
              title="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// Custom Hook to manage toast notifications
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (
      type: 'success' | 'error' | 'warning' | 'info',
      title: string,
      message?: string,
      statusBadge?: string,
      duration: number = 4500
    ) => {
      const id = Date.now().toString() + Math.random().toString().slice(2, 6);
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        statusBadge,
        timestamp: 'Just now',
      };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};
