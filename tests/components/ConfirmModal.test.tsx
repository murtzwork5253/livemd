import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ConfirmModal } from '../../src/components/ConfirmModal/ConfirmModal';

describe('ConfirmModal', () => {
  it('returns empty markup during SSR when document is unavailable', () => {
    const html = renderToStaticMarkup(
      <ConfirmModal
        isOpen={false}
        title="Delete"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(html).toBe('');
  });
});
