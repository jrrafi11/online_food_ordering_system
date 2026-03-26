import { createContext, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';

export const ToastContext = createContext(null);

let nextId = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = nextId++;
    const payload = {
      id,
      variant: toast.variant || 'info',
      title: toast.title || 'Notice',
      description: toast.description || '',
      duration: toast.duration ?? 3400,
    };

    setToasts((prev) => [...prev, payload]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, payload.duration);

    return id;
  }, []);

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[70] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto rounded-2xl border bg-white p-3 shadow-elevated transition-all duration-200',
              toast.variant === 'success' && 'border-emerald-200',
              toast.variant === 'error' && 'border-rose-200',
              toast.variant === 'info' && 'border-pink-200'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink-900">{toast.title}</p>
                {toast.description && <p className="mt-1 text-xs text-ink-500">{toast.description}</p>}
              </div>
              <button
                className="text-xs font-semibold text-ink-500 hover:text-ink-900"
                onClick={() => removeToast(toast.id)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
