import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ShareModal } from '../../src/components/ShareModal/ShareModal';

describe('ShareModal', () => {
  it('renders nothing when closed', () => {
    const html = renderToStaticMarkup(
      <ShareModal isOpen={false} onClose={vi.fn()} markdownContent="# Hi" documentTitle="Hi" />,
    );

    expect(html).toBe('');
  });

  it('renders accessible dialog when open', () => {
    const html = renderToStaticMarkup(
      <ShareModal isOpen={true} onClose={vi.fn()} markdownContent="# Hi" documentTitle="Hi" />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('Share Document');
    expect(html).toContain('Generating share link...');
  });
});
