import React, { useState } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { search, searchKeymap } from '@codemirror/search';
import { keymap } from '@codemirror/view';
import { useMarkdown } from '../../context/MarkdownContext';
import { useToast } from '../../context/ToastContext';
import { StatusBar } from '../StatusBar/StatusBar';
import { fileToMarkdown, insertAtCursor } from '../../lib/imageUpload';
import { TagInput } from '../TagInput/TagInput';
import { useDocuments } from '../../hooks/useDocuments';
import './EditorPane.css';

interface EditorPaneProps {
  editorRef: React.RefObject<ReactCodeMirrorRef | null>;
}

export function EditorPane({ editorRef }: EditorPaneProps) {
  const { state, dispatch } = useMarkdown();
  const { showToast } = useToast();
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [isDragOver, setIsDragOver] = useState(false);

  const { renameDoc, updateDocTags } = useDocuments();
  const activeDoc = state.documents.find((d) => d.id === state.activeDocId);
  const [prevDocId, setPrevDocId] = useState<string | null>(null);
  const [localTitle, setLocalTitle] = useState('');

  if (activeDoc && activeDoc.id !== prevDocId) {
    setPrevDocId(activeDoc.id);
    setLocalTitle(activeDoc.title);
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (state.documents.length === 0) return; // ignore if no doc is active
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    setIsDragOver(false);
    if (state.documents.length === 0) return;

    // Only handle image files here. Other file types (e.g. .md/.txt) fall through
    // to the editor's native text-drop handling, so don't preventDefault or toast.
    const images = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) return;

    e.preventDefault();
    const view = editorRef.current?.view;
    if (!view) return;

    // fileToMarkdown validates size and rejects with a user-facing message.
    for (const file of images) {
      try {
        const markdownTag = await fileToMarkdown(file, showToast);
        insertAtCursor(view, markdownTag);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Could not add image.', 'error');
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (state.documents.length === 0) return;
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith('image/'));

    if (imageItems.length === 0) return; // let normal text paste proceed

    e.preventDefault();
    const view = editorRef.current?.view;
    if (!view) return;

    for (const item of imageItems) {
      const file = item.getAsFile();
      if (file) {
        try {
          const markdownTag = await fileToMarkdown(file, showToast);
          insertAtCursor(view, markdownTag);
        } catch (err) {
          showToast(err instanceof Error ? err.message : 'Could not add image.', 'error');
        }
      }
    }
  };

  return (
    <div
      className="editor-container"
      style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {activeDoc && (
        <div className="editor-metadata-bar">
          <input
            type="text"
            className="editor-metadata-title"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={() => {
              const trimmed = localTitle.trim();
              if (trimmed && trimmed !== activeDoc.title) {
                renameDoc(activeDoc.id, trimmed);
              } else {
                setLocalTitle(activeDoc.title);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            placeholder="Untitled Document"
            aria-label="Document Title"
          />
          <TagInput
            tags={activeDoc.tags || []}
            onChange={(newTags) => updateDocTags(activeDoc.id, newTags)}
          />
        </div>
      )}
      <div
        className="editor-drop-zone"
        data-drag-over={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          position: 'relative',
        }}
      >
        <CodeMirror
          ref={editorRef}
          value={state.markdown}
          height="100%"
          extensions={[markdown(), search({ top: true }), keymap.of(searchKeymap)]}
          theme={state.theme === 'dark' ? oneDark : 'light'}
          onChange={(value) => dispatch({ type: 'SET_MARKDOWN', payload: value })}
          onUpdate={(update) => {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            const newLine = line.number;
            const newCol = pos - line.from + 1;
            setCursor((prev) => {
              if (prev.line === newLine && prev.col === newCol) {
                return prev;
              }
              return { line: newLine, col: newCol };
            });
          }}
          style={{ flex: 1, overflow: 'hidden' }}
        />
      </div>
      <StatusBar cursor={cursor} />
    </div>
  );
}
