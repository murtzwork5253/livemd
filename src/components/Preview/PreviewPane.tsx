import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMarkdown } from '../../context/MarkdownContext';
import { useDebounce } from '../../hooks/useDebounce';

export function PreviewPane() {
  const { state } = useMarkdown();
  const debouncedMarkdown = useDebounce(state.markdown, 300);

  return (
    <div className="preview-container">
      <div className="preview-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{debouncedMarkdown}</ReactMarkdown>
      </div>
    </div>
  );
}
