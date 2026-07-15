import React from 'react';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { openSearchPanel } from '@codemirror/search';
import './Toolbar.css';

interface ToolbarProps {
  editorRef: React.RefObject<ReactCodeMirrorRef | null>;
}

export function Toolbar({ editorRef }: ToolbarProps) {
  const handleSearch = () => {
    const view = editorRef.current?.view;
    if (view) {
      openSearchPanel(view);
    }
  };

  const handleFormat = (type: string) => {
    const view = editorRef.current?.view;
    if (!view) return;

    const state = view.state;
    const selection = state.selection.main;
    const from = selection.from;
    const to = selection.to;
    const selectedText = state.sliceDoc(from, to);

    let insertText: string;
    let selectionOffset: number;
    let selectionLength: number;

    switch (type) {
      case 'bold':
        insertText = `**${selectedText || 'text'}**`;
        selectionOffset = 2;
        selectionLength = selectedText ? selectedText.length : 4;
        break;
      case 'italic':
        insertText = `*${selectedText || 'text'}*`;
        selectionOffset = 1;
        selectionLength = selectedText ? selectedText.length : 4;
        break;
      case 'strikethrough':
        insertText = `~~${selectedText || 'text'}~~`;
        selectionOffset = 2;
        selectionLength = selectedText ? selectedText.length : 4;
        break;
      case 'code':
        insertText = `\`${selectedText || 'code'}\``;
        selectionOffset = 1;
        selectionLength = selectedText ? selectedText.length : 4;
        break;
      case 'h1': {
        const line = state.doc.lineAt(selection.head);
        view.dispatch({
          changes: { from: line.from, to: line.from, insert: '# ' },
          selection: { anchor: selection.head + 2 },
        });
        view.focus();
        return;
      }
      case 'h2': {
        const line = state.doc.lineAt(selection.head);
        view.dispatch({
          changes: { from: line.from, to: line.from, insert: '## ' },
          selection: { anchor: selection.head + 3 },
        });
        view.focus();
        return;
      }
      case 'h3': {
        const line = state.doc.lineAt(selection.head);
        view.dispatch({
          changes: { from: line.from, to: line.from, insert: '### ' },
          selection: { anchor: selection.head + 4 },
        });
        view.focus();
        return;
      }
      case 'quote': {
        const line = state.doc.lineAt(selection.head);
        view.dispatch({
          changes: { from: line.from, to: line.from, insert: '> ' },
          selection: { anchor: selection.head + 2 },
        });
        view.focus();
        return;
      }
      case 'link':
        insertText = `[${selectedText || 'link text'}](https://example.com)`;
        selectionOffset = selectedText ? selectedText.length + 3 : 12;
        selectionLength = 19; // length of 'https://example.com'
        break;
      case 'image':
        insertText = `![${selectedText || 'alt text'}](https://example.com/image.png)`;
        selectionOffset = selectedText ? selectedText.length + 4 : 13;
        selectionLength = 29; // length of 'https://example.com/image.png'
        break;
      default:
        return;
    }

    view.dispatch({
      changes: { from, to, insert: insertText },
      selection: selectedText
        ? { anchor: from + insertText.length }
        : { anchor: from + selectionOffset, head: from + selectionOffset + selectionLength },
    });

    view.focus();
  };

  return (
    <div className="editor-toolbar">
      <button onClick={() => handleFormat('bold')} title="Bold (Ctrl+B)">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </button>
      <button onClick={() => handleFormat('italic')} title="Italic (Ctrl+I)">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <line x1="19" y1="4" x2="10" y2="4" />
          <line x1="14" y1="20" x2="5" y2="20" />
          <line x1="15" y1="4" x2="9" y2="20" />
        </svg>
      </button>
      <button onClick={() => handleFormat('strikethrough')} title="Strikethrough (Ctrl+Shift+X)">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <path d="M16 4H9a3 3 0 0 0-2.83 4 3 3 0 0 0 2.5 4h6.66a3 3 0 0 1 2.5 4 3 3 0 0 1-2.83 4H7" />
          <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
      </button>
      <button onClick={() => handleFormat('code')} title="Code (Ctrl+`)">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </button>
      <div className="toolbar-divider" />
      <button onClick={() => handleFormat('h1')} title="Heading 1">
        <span className="toolbar-text">H1</span>
      </button>
      <button onClick={() => handleFormat('h2')} title="Heading 2">
        <span className="toolbar-text">H2</span>
      </button>
      <button onClick={() => handleFormat('h3')} title="Heading 3">
        <span className="toolbar-text">H3</span>
      </button>
      <div className="toolbar-divider" />
      <button onClick={() => handleFormat('link')} title="Link (Ctrl+K)">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
      <button onClick={() => handleFormat('image')} title="Image">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </button>
      <button onClick={() => handleFormat('quote')} title="Quote">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <path d="M16 13a4 4 0 0 1-4-4V5h4v4h-2a2 2 0 0 0 2 2zM8 13A4 4 0 0 1 4 9V5h4v4H6a2 2 0 0 0 2 2z" />
        </svg>
      </button>
      <div className="toolbar-divider" />
      <button onClick={handleSearch} title="Find & Replace (Ctrl+F)">
        <svg
          viewBox="0 0 24 24"
          className="toolbar-icon"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </div>
  );
}
