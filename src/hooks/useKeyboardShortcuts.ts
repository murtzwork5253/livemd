import { useEffect } from 'react';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';

import type { ViewMode } from '../context/markdownReducer';

interface KeyboardShortcutsProps {
  editorRef: React.RefObject<ReactCodeMirrorRef | null>;
  onSave?: () => void;
  onToggleSidebar?: () => void;
  onChangeView?: (view: ViewMode) => void;
}

export function useKeyboardShortcuts({
  editorRef,
  onSave,
  onToggleSidebar,
  onChangeView,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const view = editorRef.current?.view;
        if (!view) return;

        const state = view.state;
        const selection = state.selection.main;
        const from = selection.from;
        const to = selection.to;
        const selectedText = state.sliceDoc(from, to);

        const key = e.key.toLowerCase();

        if (key === 'b') {
          if (e.shiftKey) {
            e.preventDefault();
            if (onToggleSidebar) {
              onToggleSidebar();
            }
          } else {
            e.preventDefault();
            const prefix = '**';
            const suffix = '**';
            const insertText = `${prefix}${selectedText || 'text'}${suffix}`;

            view.dispatch({
              changes: { from, to, insert: insertText },
              selection: selectedText
                ? { anchor: from + insertText.length }
                : { anchor: from + prefix.length, head: from + prefix.length + 4 },
            });
            view.focus();
          }
        } else if (key === 'i') {
          e.preventDefault();
          const prefix = '*';
          const suffix = '*';
          const insertText = `${prefix}${selectedText || 'text'}${suffix}`;

          view.dispatch({
            changes: { from, to, insert: insertText },
            selection: selectedText
              ? { anchor: from + insertText.length }
              : { anchor: from + prefix.length, head: from + prefix.length + 4 },
          });
          view.focus();
        } else if (e.shiftKey && key === 'x') {
          e.preventDefault();
          const prefix = '~~';
          const suffix = '~~';
          const insertText = `${prefix}${selectedText || 'text'}${suffix}`;

          view.dispatch({
            changes: { from, to, insert: insertText },
            selection: selectedText
              ? { anchor: from + insertText.length }
              : { anchor: from + prefix.length, head: from + prefix.length + 4 },
          });
          view.focus();
        } else if (key === '`') {
          e.preventDefault();
          const prefix = '`';
          const suffix = '`';
          const insertText = `${prefix}${selectedText || 'code'}${suffix}`;

          view.dispatch({
            changes: { from, to, insert: insertText },
            selection: selectedText
              ? { anchor: from + insertText.length }
              : { anchor: from + prefix.length, head: from + prefix.length + 4 },
          });
          view.focus();
        } else if (key === 'k') {
          e.preventDefault();
          const insertText = `[${selectedText || 'link text'}](https://example.com)`;
          const selectionOffset = selectedText ? selectedText.length + 3 : 12;
          const selectionLength = 19;

          view.dispatch({
            changes: { from, to, insert: insertText },
            selection: {
              anchor: from + selectionOffset,
              head: from + selectionOffset + selectionLength,
            },
          });
          view.focus();
        } else if (key === '\\') {
          e.preventDefault();
          if (onToggleSidebar) {
            onToggleSidebar();
          }
        } else if (e.altKey && key === '1') {
          e.preventDefault();
          onChangeView?.('editor');
        } else if (e.altKey && key === '2') {
          e.preventDefault();
          onChangeView?.('split');
        } else if (e.altKey && key === '3') {
          e.preventDefault();
          onChangeView?.('preview');
        } else if (key === 's') {
          e.preventDefault();
          if (onSave) {
            onSave();
          }
        }
      } else if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          onChangeView?.('editor');
        } else if (e.key === '2') {
          e.preventDefault();
          onChangeView?.('split');
        } else if (e.key === '3') {
          e.preventDefault();
          onChangeView?.('preview');
        }
      }
    };

    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editorRef, onSave, onToggleSidebar, onChangeView]);
}
