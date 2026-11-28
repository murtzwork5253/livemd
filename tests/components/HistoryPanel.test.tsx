import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { HistoryPanel } from '../../src/components/HistoryPanel/HistoryPanel';
import { useMarkdown } from '../../src/context/MarkdownContext';
import type { MarkdownState } from '../../src/context/markdownReducer';

vi.mock('../../src/components/ConfirmModal/ConfirmModal', () => ({
  ConfirmModal: () => null,
}));

vi.mock('../../src/lib/db', () => ({
  getSnapshotsForDoc: vi.fn().mockResolvedValue([]),
  deleteSnapshot: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/context/MarkdownContext', () => ({
  useMarkdown: vi.fn(),
}));

describe('HistoryPanel', () => {
  it('renders nothing when closed', () => {
    vi.mocked(useMarkdown).mockReturnValue({
      state: { snapshots: [] } as unknown as MarkdownState,
      dispatch: vi.fn(),
    });

    const html = renderToStaticMarkup(
      <HistoryPanel
        isOpen={false}
        onClose={vi.fn()}
        activeDocId="doc-1"
        onSnapshotRestored={vi.fn()}
      />,
    );

    expect(html).toBe('');
  });

  it('renders empty state when open with no snapshots', () => {
    vi.mocked(useMarkdown).mockReturnValue({
      state: { snapshots: [] } as unknown as MarkdownState,
      dispatch: vi.fn(),
    });

    const html = renderToStaticMarkup(
      <HistoryPanel
        isOpen={true}
        onClose={vi.fn()}
        activeDocId="doc-1"
        onSnapshotRestored={vi.fn()}
      />,
    );

    expect(html).toContain('Version History');
    expect(html).toContain('No snapshots recorded yet.');
  });
});
