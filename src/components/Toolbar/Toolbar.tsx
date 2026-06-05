import React from 'react';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import './Toolbar.css';

interface ToolbarProps {
  editorRef: React.RefObject<ReactCodeMirrorRef | null>;
}

export function Toolbar({ editorRef }: ToolbarProps) {
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
          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 11h-3.5v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
        </svg>
      </button>
      <button onClick={() => handleFormat('italic')} title="Italic (Ctrl+I)">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
        </svg>
      </button>
      <button onClick={() => handleFormat('strikethrough')} title="Strikethrough (Ctrl+Shift+X)">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <path d="M10 19h4v-3h-4v3zM5 4v3h5v3H4v3h6v2H5v3h5v2h4v-2h5v-3h-5v-2h6V7h-7V4H5z" />
        </svg>
      </button>
      <button onClick={() => handleFormat('code')} title="Code (Ctrl+`)">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
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
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
        </svg>
      </button>
      <button onClick={() => handleFormat('image')} title="Image">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
      </button>
      <button onClick={() => handleFormat('quote')} title="Quote">
        <svg viewBox="0 0 24 24" className="toolbar-icon">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
      </button>
    </div>
  );
}
