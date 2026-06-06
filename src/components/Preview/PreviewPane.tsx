import React, { createContext, useContext, useRef, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMarkdown } from '../../context/MarkdownContext';
import { useDebounce } from '../../hooks/useDebounce';
import { slugify } from '../../lib/markdownHelpers';
import { TableOfContents } from '../TableOfContents/TableOfContents';

const SlugsContext = createContext<React.MutableRefObject<Record<string, number>> | null>(null);

function getTextFromChildren(children: React.ReactNode): string {
  if (!children) return '';
  if (typeof children === 'string' || typeof children === 'number') {
    return children.toString();
  }
  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join('');
  }
  if (React.isValidElement(children)) {
    return getTextFromChildren(
      (children as React.ReactElement<{ children?: React.ReactNode }>).props.children,
    );
  }
  return '';
}

interface HeadingRendererProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: number;
  node?: unknown;
}

const HeadingRenderer = ({ level, children, ...props }: HeadingRendererProps) => {
  const text = getTextFromChildren(children);
  let slug = slugify(text);
  const slugsContext = useContext(SlugsContext);

  if (slugsContext) {
    const slugsCount = slugsContext.current;
    if (slugsCount[slug] !== undefined) {
      // eslint-disable-next-line react-hooks/immutability
      slugsCount[slug]++;
      slug = `${slug}-${slugsCount[slug]}`;
    } else {
      // eslint-disable-next-line react-hooks/immutability
      slugsCount[slug] = 0;
    }
  }

  // Remove node prop from HTML element attributes to avoid React warnings
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { node, ...rest } = props;

  return React.createElement(`h${level}`, { id: slug, ...rest }, children);
};

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingRenderer level={1} {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingRenderer level={2} {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingRenderer level={3} {...props} />,
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingRenderer level={4} {...props} />,
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingRenderer level={5} {...props} />,
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingRenderer level={6} {...props} />,
};

interface MemoizedMarkdownProps {
  content: string;
  components: typeof components;
}

const MemoizedMarkdown = memo(
  ({ content, components }: MemoizedMarkdownProps) => {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content,
);

export function PreviewPane() {
  const { state } = useMarkdown();
  const debouncedMarkdown = useDebounce(state.markdown, 300);
  const slugsCountRef = useRef<Record<string, number>>({});

  // Reset the count for this render pass
  // eslint-disable-next-line react-hooks/refs
  slugsCountRef.current = {};

  return (
    <SlugsContext.Provider value={slugsCountRef}>
      <TableOfContents markdown={debouncedMarkdown} />
      <div className="preview-container" id="preview-pane-container">
        <div className="preview-content">
          <MemoizedMarkdown content={debouncedMarkdown} components={components} />
        </div>
      </div>
    </SlugsContext.Provider>
  );
}
export default PreviewPane;
