import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Toast } from '../../context/ToastContext';
import './Toast.css';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

/**
 * Renders the stack of active toasts in a fixed, screen-corner container via a
 * portal on `document.body`, so notifications float above all app chrome.
 */
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="toast-container" aria-live="assertive" aria-atomic="false">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout={!shouldReduceMotion}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`toast toast-${toast.variant}`}
            role="alert"
          >
            <svg
              viewBox="0 0 24 24"
              className="toast-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="toast-text">{toast.message}</span>
            <button
              className="toast-close-btn"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

export default ToastContainer;
