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
import { getSharedDocFromURL } from './lib/shareLink';
import { ShareModal } from './components/ShareModal/ShareModal';
import { useVersionHistory } from './hooks/useVersionHistory';
import { HistoryPanel } from './components/HistoryPanel/HistoryPanel';
import { SettingsModal } from './components/SettingsModal/SettingsModal';
import { TemplateModal } from './components/TemplateModal/TemplateModal';
import './App.css';

export default function App() {
  const { state, dispatch } = useMarkdown();
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const { loadAllDocs, createDoc } = useDocuments();

  const [isShareOpen, setIsShareOpen] = useState(false);
  const sharedDocRef = useRef<{ title: string; content: string } | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const { createSnapshot } = useVersionHistory();

  useEffect(() => {
    const initDocsAndShare = async () => {
      await loadAllDocs();
      const shared = await getSharedDocFromURL();
      if (shared) {
        sharedDocRef.current = shared;
        dispatch({ type: 'SET_MARKDOWN', payload: shared.content });
        dispatch({ type: 'SET_VIEW_MODE', payload: 'preview' });
        dispatch({ type: 'SET_SHARED_VIEW', payload: true });
      }
    };
    initDocsAndShare();
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

          // Save manual snapshot on manual save trigger
          await createSnapshot('Manual Save');

          const docs = await getAllDocuments();
          docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          dispatch({ type: 'SET_DOCUMENTS', payload: docs });
        }
      } catch (err) {
        console.error('Failed to save document:', err);
      }
    }
  };

  const handleCreatePersonalCopy = async () => {
    if (sharedDocRef.current) {
      await createDoc(sharedDocRef.current.title, sharedDocRef.current.content);
      dispatch({ type: 'SET_SHARED_VIEW', payload: false });
      sharedDocRef.current = null;
      // Strip share query from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('share');
      window.history.replaceState({}, '', url.pathname + url.search);
      dispatch({ type: 'SET_VIEW_MODE', payload: 'split' });
    }
  };

  const handleDismissShareBanner = () => {
    dispatch({ type: 'SET_SHARED_VIEW', payload: false });
    sharedDocRef.current = null;
    // Strip share query from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('share');
    window.history.replaceState({}, '', url.pathname + url.search);
    loadAllDocs();
  };

  useAutosave(1000);
  useKeyboardShortcuts({
    editorRef,
    onSave: handleSave,
    onToggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    onChangeView: (view) => dispatch({ type: 'SET_VIEW_MODE', payload: view }),
  });
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
            className={`share-btn ${state.documents.length === 0 || state.isSharedView ? 'disabled' : ''}`}
            onClick={() =>
              !state.isSharedView && state.documents.length > 0 && setIsShareOpen(true)
            }
            disabled={state.documents.length === 0 || state.isSharedView}
            title={
              state.isSharedView
                ? 'Cannot share a shared link'
                : state.documents.length === 0
                  ? 'No document to share'
                  : 'Share Document'
            }
            aria-label="Share Document"
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
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button
            className={`history-toggle-btn ${isHistoryOpen ? 'active' : ''} ${state.documents.length === 0 ? 'disabled' : ''}`}
            onClick={() => state.documents.length > 0 && setIsHistoryOpen(!isHistoryOpen)}
            disabled={state.documents.length === 0}
            title={state.documents.length === 0 ? 'No history available' : 'Version History'}
            aria-label="Version History"
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
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
          {/* <div className="theme-toggle">
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
          </div> */}
          <button
            className="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            aria-label="Settings"
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {state.isSharedView && (
        <div className="shared-banner" role="status">
          <span>
            You are viewing a shared document. Click <strong>Edit Copy</strong> to save a personal
            copy.
          </span>
          <div className="shared-banner-actions">
            <button className="banner-action-btn edit" onClick={handleCreatePersonalCopy}>
              Edit Copy
            </button>
            <button
              className="banner-close-btn"
              onClick={handleDismissShareBanner}
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
                  onClick={() => setIsTemplateModalOpen(true)}
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

        <HistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          activeDocId={state.activeDocId}
          onSnapshotRestored={() => {
            // Take a snapshot right before restoring, so the user can easily undo if they want
            createSnapshot('Before restore');
          }}
        />
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        markdownContent={state.markdown}
      />
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        markdownContent={state.markdown}
        documentTitle={
          state.documents.find((d) => d.id === state.activeDocId)?.title || 'Untitled Document'
        }
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {isTemplateModalOpen && (
        <TemplateModal
          onSelect={async (template) => {
            await createDoc(template.getTitle(), template.getContent());
            setIsTemplateModalOpen(false);
          }}
          onStartBlank={async () => {
            await createDoc('Untitled Document');
            setIsTemplateModalOpen(false);
          }}
          onClose={() => setIsTemplateModalOpen(false)}
        />
      )}
    </div>
  );
}
