import React, { useState, useRef, useEffect } from 'react';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useMarkdown } from './context/MarkdownContext';
import { EditorPane } from './components/Editor/EditorPane';
import { PreviewPane } from './components/Preview/PreviewPane';
import { Toolbar } from './components/Toolbar/Toolbar';
import { useAutosave } from './hooks/useAutosave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ExportModal } from './components/ExportModal/ExportModal';
import { Sidebar } from './components/Sidebar/Sidebar';
import { useDocuments } from './hooks/useDocuments';
import { saveDocument, getDocument, getAllDocuments } from './lib/db';
import './App.css';

export default function App() {
  const { state, dispatch } = useMarkdown();
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const { loadAllDocs, createDoc } = useDocuments();

  useEffect(() => {
    loadAllDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (state.activeDocId) {
      try {
        const doc = await getDocument(state.activeDocId);
        if (doc) {
          const updatedDoc = {
            ...doc,
            content: state.markdown,
            updatedAt: new Date(),
          };
          await saveDocument(updatedDoc);
          dispatch({ type: 'SET_LAST_SAVED', payload: updatedDoc.updatedAt });
          const docs = await getAllDocuments();
          docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          dispatch({ type: 'SET_DOCUMENTS', payload: docs });
        }
      } catch (err) {
        console.error('Failed to save document:', err);
      }
    }
  };

  useAutosave(1000);
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
          <button
            className={`sidebar-toggle-btn ${state.sidebarOpen ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            title={state.sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={state.sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg
              viewBox="0 0 24 24"
              className="header-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
          <h1>LiveMD</h1>
        </div>
        <div
          className={`view-mode-toggle ${state.documents.length === 0 ? 'disabled' : ''}`}
          role="group"
          aria-label="View mode selection"
        >
          <button
            className={state.viewMode === 'editor' ? 'active' : ''}
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'editor' })}
            title="Editor view"
            aria-label="Editor view"
            aria-pressed={state.viewMode === 'editor'}
            disabled={state.documents.length === 0}
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
            disabled={state.documents.length === 0}
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
            disabled={state.documents.length === 0}
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
        <div className="header-right">
          <button
            className={`export-btn ${state.documents.length === 0 ? 'disabled' : ''}`}
            onClick={() => state.documents.length > 0 && setIsExportOpen(true)}
            disabled={state.documents.length === 0}
            title={state.documents.length === 0 ? 'No document to export' : 'Export Document'}
            aria-label="Export Document"
          >
            <svg
              viewBox="0 0 24 24"
              className="header-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
          </button>
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
        </div>
      </header>

      <div className="app-body">
        {state.sidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} />
        )}
        <div className={`sidebar-container ${state.sidebarOpen ? 'open' : 'collapsed'}`}>
          <Sidebar />
        </div>

        <main className={`workspace mode-${state.viewMode} mobile-tab-${mobileTab}`}>
          {state.documents.length === 0 && !state.isLoading ? (
            <div className="empty-workspace">
              <div className="empty-workspace-content">
                <div className="empty-workspace-illustration">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h2>Start writing in LiveMD</h2>
                <p>
                  Create a new document to get started. Your documents are stored securely in your
                  browser's IndexedDB.
                </p>
                <button
                  className="create-first-doc-btn"
                  onClick={() => createDoc('Untitled Document')}
                  aria-label="Create your first document"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create Document
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mobile-tabs-header">
                <button
                  className={`mobile-tab-btn ${mobileTab === 'editor' ? 'active' : ''}`}
                  onClick={() => setMobileTab('editor')}
                  aria-label="Editor view"
                >
                  Write
                </button>
                <button
                  className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setMobileTab('preview')}
                  aria-label="Preview view"
                >
                  Preview
                </button>
              </div>

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
                <div
                  className="pane-divider"
                  onMouseDown={handleMouseDown}
                  title="Drag to resize"
                />
              )}

              {state.viewMode !== 'editor' && (
                <div
                  className="pane preview-pane"
                  style={{ width: state.viewMode === 'split' ? `${100 - editorWidth}%` : '100%' }}
                >
                  <PreviewPane />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        markdownContent={state.markdown}
      />
    </div>
  );
}
