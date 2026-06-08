import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMarkdown } from '../../context/MarkdownContext';
import { useDebounce } from '../../hooks/useDebounce';
import { slugify } from '../../lib/markdownHelpers';
import { TableOfContents } from '../TableOfContents/TableOfContents';
import ErrorBoundary from './ErrorBoundary';

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
  const slug = slugify(text);
  console.log(`HeadingRenderer h${level} text: "${text}" -> ID: "${slug}"`);

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
  a: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { node?: unknown }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { node, ...rest } = props;
    if (href && href.startsWith('#')) {
      const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        console.log('PreviewPane handleHashClick called with href:', href);
        e.preventDefault();
        const id = decodeURIComponent(href.slice(1));
        const container = document.getElementById('preview-pane-container');
        let element = document.getElementById(id);
        console.log('PreviewPane container:', !!container, 'initial element by ID:', !!element);

        if (!element && container) {
          const normalizedTarget = id.toLowerCase().replace(/[^a-z0-9]/g, '');
          console.log('Fuzzy matching. Normalized target ID:', normalizedTarget);
          const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
          for (const heading of Array.from(headings)) {
            const headingId = heading.getAttribute('id') || '';
            const normalizedHeading = headingId.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedHeading === normalizedTarget) {
              element = heading as HTMLElement;
              break;
            }
          }
          console.log('Fuzzy matched element found:', !!element);
        }

        if (container && element) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const scrollOffset = elementRect.top - containerRect.top + container.scrollTop - 16;
          console.log('Scrolling container to offset:', scrollOffset);

          container.scrollTo({
            top: scrollOffset,
            behavior: 'smooth',
          });
        } else if (element) {
          console.log('Container not found, scrolling element directly');
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          console.warn('Target heading element not found for id:', id);
        }

        window.history.pushState(null, '', href);
      };

      return (
        <a href={href} onClick={handleHashClick} {...rest}>
          {children}
        </a>
      );
    }

    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  },
};

interface MemoizedMarkdownProps {
  content: string;
  components: typeof components;
}

const MemoizedMarkdown = memo(
  ({ content, components }: MemoizedMarkdownProps) => {
    // Add this simulation check:
    if (content.includes('trigger-crash')) {
      throw new Error('Simulated Markdown Preview Crash!');
    }
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

  return (
    <>
      <TableOfContents markdown={debouncedMarkdown} />
      <div className="preview-container" id="preview-pane-container">
        <div className="preview-content">
          <ErrorBoundary resetKey={debouncedMarkdown}>
            <MemoizedMarkdown content={debouncedMarkdown} components={components} />
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}
export default PreviewPane;
