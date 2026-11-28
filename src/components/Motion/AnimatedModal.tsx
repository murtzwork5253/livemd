import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import './AnimatedModal.css';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabelledBy: string;
  overlayClassName?: string;
  contentClassName?: string;
  children: ReactNode;
}

/**
 * Shared modal backdrop + dialog wrapper with AnimatePresence enter/exit
 * transitions that respect `prefers-reduced-motion`.
 */
export function AnimatedModal({
  isOpen,
  onClose,
  ariaLabelledBy,
  overlayClassName = 'modal-overlay',
  contentClassName = 'modal-content',
  children,
}: AnimatedModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const duration = shouldReduceMotion ? 0 : 0.16;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={overlayClassName}
          onClick={onClose}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        >
          <motion.div
            className={contentClassName}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
