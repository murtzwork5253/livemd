import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMarkdown } from '../../context/MarkdownContext';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, dispatch } = useMarkdown();

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { name: 'Bold Text', keys: ['Ctrl', 'B'] },
    { name: 'Italic Text', keys: ['Ctrl', 'I'] },
    { name: 'Strikethrough', keys: ['Ctrl', 'Shift', 'X'] },
    { name: 'Code Inline', keys: ['Ctrl', '`'] },
    { name: 'Insert Link', keys: ['Ctrl', 'K'] },
    { name: 'Save Document', keys: ['Ctrl', 'S'] },
    { name: 'Toggle Sidebar', keys: ['Ctrl', 'Shift', 'B'] },
    { name: 'Editor View', keys: ['Ctrl', 'Alt', '1'] },
    { name: 'Split View', keys: ['Ctrl', 'Alt', '2'] },
    { name: 'Preview View', keys: ['Ctrl', 'Alt', '3'] },
  ];

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content settings-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className="modal-header">
          <h2 id="settings-modal-title">Settings</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body settings-modal-body">
          <section className="settings-section">
            <h3>Theme</h3>
            <div className="theme-options">
              <button
                className={`theme-option-btn light ${state.theme === 'light' ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_THEME', payload: 'light' })}
                title="Switch to light mode"
                aria-pressed={state.theme === 'light'}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="theme-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
                <span>Light Mode</span>
              </button>
              <button
                className={`theme-option-btn dark ${state.theme === 'dark' ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}
                title="Switch to dark mode"
                aria-pressed={state.theme === 'dark'}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="theme-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a9 9 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
                <span>Dark Mode</span>
              </button>
            </div>
          </section>

          <section className="settings-section">
            <h3>Keyboard Shortcuts</h3>
            <div className="shortcuts-grid">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.name} className="shortcut-row">
                  <span className="shortcut-name">{shortcut.name}</span>
                  <div className="shortcut-keys-container">
                    <div className="shortcut-keys">
                      {shortcut.keys.map((k, i) => (
                        <kbd key={i} className="shortcut-key">
                          {k}
                        </kbd>
                      ))}
                    </div>
                    {/* {shortcut.extra && <span className="shortcut-extra">{shortcut.extra}</span>} */}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="settings-section app-info-section">
            <div className="app-info-header">
              <h3>About LiveMD</h3>
              <span className="app-version-badge">v1.1.0</span>
            </div>
            <p className="app-description">
              A premium, distraction-free markdown editor with live preview, auto-save version
              history snapshots, and offline availability.
            </p>
            {/* <div className="app-tech-stack">
              <span>React 19</span>
              <span>TypeScript</span>
              <span>CodeMirror 6</span>
              <span>IndexedDB</span>
            </div> */}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default SettingsModal;
