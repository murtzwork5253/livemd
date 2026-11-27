import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PreviewPane } from '../../src/components/Preview/PreviewPane';
import ErrorBoundary from '../../src/components/Preview/ErrorBoundary';
import { useMarkdown } from '../../src/context/MarkdownContext';
import type { MarkdownState } from '../../src/context/markdownReducer';

vi.mock('../../src/context/MarkdownContext', () => ({
  useMarkdown: vi.fn(),
}));

vi.mock('../../src/hooks/useDebounce', () => ({
  useDebounce: vi.fn((val: string) => val),
}));

const baseReadingSettings = {
  fontFamily: 'sans' as const,
  fontSize: 16,
  lineHeight: 1.6,
  lineWidth: 720,
};

describe('PreviewPane', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders GFM markdown, heading slugs, and safe external links', () => {
    vi.mocked(useMarkdown).mockReturnValue({
      state: {
        markdown: [
          '# Hello World',
          '',
          'Visit [Example](https://example.com) or jump to [Section](#hello-world).',
          '',
          '- [x] Done task',
          '- [ ] Open task',
        ].join('\n'),
        viewMode: 'split',
        readingSettings: baseReadingSettings,
      } as unknown as MarkdownState,
      dispatch: vi.fn(),
    });

    const html = renderToStaticMarkup(<PreviewPane />);

    expect(html).toContain('<h1 id="hello-world">Hello World</h1>');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('type="checkbox"');
  });

  it('allows data:image/* URIs while blocking dangerous data:text/html URIs', () => {
    vi.mocked(useMarkdown).mockReturnValue({
      state: {
        markdown: [
          '![ok](data:image/png;base64,iVBORw0KGgo=)',
          '',
          '[bad](data:text/html,<script>alert(1)</script>)',
        ].join('\n'),
        viewMode: 'split',
        readingSettings: baseReadingSettings,
      } as unknown as MarkdownState,
      dispatch: vi.fn(),
    });

    const html = renderToStaticMarkup(<PreviewPane />);

    expect(html).toContain('src="data:image/png;base64,iVBORw0KGgo="');
    expect(html).not.toContain('data:text/html');
  });

  it('renders TypographyPanel only in preview-only mode', () => {
    vi.mocked(useMarkdown).mockReturnValue({
      state: {
        markdown: '# Test',
        viewMode: 'preview',
        readingSettings: baseReadingSettings,
      } as unknown as MarkdownState,
      dispatch: vi.fn(),
    });

    const previewHtml = renderToStaticMarkup(<PreviewPane />);
    expect(previewHtml).toContain('Typography');

    vi.mocked(useMarkdown).mockReturnValue({
      state: {
        markdown: '# Test',
        viewMode: 'split',
        readingSettings: baseReadingSettings,
      } as unknown as MarkdownState,
      dispatch: vi.fn(),
    });

    const splitHtml = renderToStaticMarkup(<PreviewPane />);
    expect(splitHtml).not.toContain('typography-panel');
  });

  it('ErrorBoundary transitions to error state and renders fallback UI', () => {
    const errorState = ErrorBoundary.getDerivedStateFromError(
      new Error('Simulated Markdown Preview Crash!'),
    );
    expect(errorState.hasError).toBe(true);
    expect(errorState.error?.message).toBe('Simulated Markdown Preview Crash!');

    const boundary = new ErrorBoundary({ children: null });
    boundary.state = errorState;
    const html = renderToStaticMarkup(boundary.render());
    expect(html).toContain('Unable to render preview');
  });
});
