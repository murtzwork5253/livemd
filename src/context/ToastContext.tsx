import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { nanoid } from 'nanoid';
import { ToastContainer } from '../components/Toast/ToastContainer';

export type ToastVariant = 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  /** Shows a transient notification. Defaults to the `warning` variant. */
  showToast: (message: string, variant?: ToastVariant) => void;
  /** Dismisses a toast early by id. */
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_TIMEOUT_MS = 5000;

/**
 * App-wide toast provider. Renders the toast stack via a portal and exposes
 * `showToast` so any feature (image upload, share-link loading, …) can surface
 * user-facing validation errors instead of logging them to the console.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timeouts.current.get(id);
    if (handle !== undefined) {
      window.clearTimeout(handle);
      timeouts.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'warning') => {
      const id = nanoid();
      setToasts((prev) => [...prev, { id, message, variant }]);
      const handle = window.setTimeout(() => dismissToast(id), TOAST_TIMEOUT_MS);
      timeouts.current.set(id, handle);
    },
    [dismissToast],
  );

  // Clear any pending timers on unmount.
  useEffect(() => {
    const pending = timeouts.current;
    return () => {
      pending.forEach((handle) => window.clearTimeout(handle));
      pending.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

/** Accesses the toast API. Must be called within a {@link ToastProvider}. */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
