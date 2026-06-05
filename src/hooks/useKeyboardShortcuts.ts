import { useEffect } from 'react';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';

interface KeyboardShortcutsProps {
  editorRef: React.RefObject<ReactCodeMirrorRef | null>;
  onSave?: () => void;
}

export function useKeyboardShortcuts({ editorRef, onSave }: KeyboardShortcutsProps) {
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
        } else if (key === 's') {
          e.preventDefault();
          if (onSave) {
            onSave();
          }
        }
      }
    };

    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editorRef, onSave]);
}
