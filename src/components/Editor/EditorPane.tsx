import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useMarkdown } from '../../context/MarkdownContext';

interface EditorPaneProps {
  editorRef: React.RefObject<ReactCodeMirrorRef | null>;
}

export function EditorPane({ editorRef }: EditorPaneProps) {
  const { state, dispatch } = useMarkdown();

  return (
    <div className="editor-container" style={{ height: '100%', width: '100%' }}>
      <CodeMirror
        ref={editorRef}
        value={state.markdown}
        height="100%"
        extensions={[markdown()]}
        theme={state.theme === 'dark' ? oneDark : 'light'}
        onChange={(value) => dispatch({ type: 'SET_MARKDOWN', payload: value })}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}
