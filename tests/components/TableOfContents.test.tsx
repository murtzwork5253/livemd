import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TableOfContents } from '../../src/components/TableOfContents/TableOfContents';

describe('TableOfContents', () => {
  it('renders the toggle button with aria-expanded="false" initially', () => {
    const html = renderToStaticMarkup(<TableOfContents markdown="# Heading 1\n## Heading 2" />);

    expect(html).toContain('aria-label="Table of Contents"');
    expect(html).toContain('aria-expanded="false"');
  });
});
