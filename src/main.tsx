import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import './styles/globals.css';
import App from './App.tsx';
import { MarkdownProvider } from './context/MarkdownContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <MarkdownProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MarkdownProvider>
    </MotionConfig>
  </StrictMode>,
);
