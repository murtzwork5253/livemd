import { createPortal } from 'react-dom';
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
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container" aria-live="assertive" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.variant}`} role="alert">
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
        </div>
      ))}
    </div>,
    document.body,
  );
}

export default ToastContainer;
