import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ToastContext, type ToastInput, type ToastItem } from "./toastContext";

function ToastCard({ toast, onDone }: { toast: ToastItem; onDone: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDone(toast.id), 3400);
    return () => window.clearTimeout(timer);
  }, [onDone, toast.id]);

  return (
    <div className={`toast toast-${toast.tone}`}>
      <span className="toast-title">{toast.title}</span>
      <span className="toast-message">{toast.message}</span>
      <span className="toast-progress" />
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: ToastInput) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { ...toast, id }]);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-stack" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDone={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
