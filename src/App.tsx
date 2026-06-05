import React, { useState, useRef, useEffect } from 'react';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useMarkdown } from './context/MarkdownContext';
import { EditorPane } from './components/Editor/EditorPane';
import { PreviewPane } from './components/Preview/PreviewPane';
import { Toolbar } from './components/Toolbar/Toolbar';
import { useAutosave } from './hooks/useAutosave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './App.css';

export default function App() {
  const { state, dispatch } = useMarkdown();
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const handleSave = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('livemd-markdown', state.markdown);
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
    }
  };

  useAutosave('livemd-markdown', state.markdown, 1000);
  useKeyboardShortcuts({ editorRef, onSave: handleSave });
  const [editorWidth, setEditorWidth] = useState(50); // percentage
  const isResizing = useRef(false);

  // Sync the html data-theme with state.theme and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('livemd-theme', state.theme);
    }
  }, [state.theme]);

  // Sync viewMode to localStorage
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('livemd-viewmode', state.viewMode);
    }
  }, [state.viewMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setEditorWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>LiveMD</h1>
        </div>
        <div className="view-mode-toggle" role="group" aria-label="View mode selection">
          <button
            className={state.viewMode === 'editor' ? 'active' : ''}
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'editor' })}
            title="Editor view"
            aria-label="Editor view"
            aria-pressed={state.viewMode === 'editor'}
          >
            <svg
              viewBox="0 0 24 24"
              className="toggle-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            className={state.viewMode === 'split' ? 'active' : ''}
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'split' })}
            title="Split view"
            aria-label="Split view"
            aria-pressed={state.viewMode === 'split'}
          >
            <svg
              viewBox="0 0 24 24"
              className="toggle-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M12 3v18" />
            </svg>
          </button>
          <button
            className={state.viewMode === 'preview' ? 'active' : ''}
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'preview' })}
            title="Preview view"
            aria-label="Preview view"
            aria-pressed={state.viewMode === 'preview'}
          >
            <svg
              viewBox="0 0 24 24"
              className="toggle-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
        <div className="theme-toggle">
          <button
            onClick={() =>
              dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' })
            }
            title={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {state.theme === 'dark' ? (
              <svg viewBox="0 0 24 24" className="theme-icon">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="theme-icon">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className={`workspace mode-${state.viewMode}`}>
        {state.viewMode !== 'preview' && (
          <div
            className="pane editor-pane"
            style={{ width: state.viewMode === 'split' ? `${editorWidth}%` : '100%' }}
          >
            <Toolbar editorRef={editorRef} />
            <EditorPane editorRef={editorRef} />
          </div>
        )}

        {state.viewMode === 'split' && (
          <div className="pane-divider" onMouseDown={handleMouseDown} title="Drag to resize" />
        )}

        {state.viewMode !== 'editor' && (
          <div
            className="pane preview-pane"
            style={{ width: state.viewMode === 'split' ? `${100 - editorWidth}%` : '100%' }}
          >
            <PreviewPane />
          </div>
        )}
      </main>
    </div>
  );
}
