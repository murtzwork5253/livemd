import React, { useState } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useMarkdown } from '../../context/MarkdownContext';
import { StatusBar } from '../StatusBar/StatusBar';

interface EditorPaneProps {
  editorRef: React.RefObject<ReactCodeMirrorRef | null>;
}

export function EditorPane({ editorRef }: EditorPaneProps) {
  const { state, dispatch } = useMarkdown();
  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  return (
    <div
      className="editor-container"
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CodeMirror
        ref={editorRef}
        value={state.markdown}
        height="100%"
        extensions={[markdown()]}
        theme={state.theme === 'dark' ? oneDark : 'light'}
        onChange={(value) => dispatch({ type: 'SET_MARKDOWN', payload: value })}
        onUpdate={(update) => {
          const pos = update.state.selection.main.head;
          const line = update.state.doc.lineAt(pos);
          setCursor({
            line: line.number,
            col: pos - line.from + 1,
          });
        }}
        style={{ flex: 1, overflow: 'hidden' }}
      />
      <StatusBar cursor={cursor} />
    </div>
  );
}
