import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAutosave } from '../../src/hooks/useAutosave';
import { useMarkdown } from '../../src/context/MarkdownContext';
import { useDebounce } from '../../src/hooks/useDebounce';
import { getDocument, saveDocument, getAllDocuments } from '../../src/lib/db';
import type { MarkdownState } from '../../src/context/markdownReducer';

// Mock useDebounce
vi.mock('../../src/hooks/useDebounce', () => ({
  useDebounce: vi.fn((val) => val),
}));

// Mock useMarkdown context hook
vi.mock('../../src/context/MarkdownContext', () => ({
  useMarkdown: vi.fn(),
}));

// Mock IndexedDB operations
vi.mock('../../src/lib/db', () => ({
  getDocument: vi.fn(),
  saveDocument: vi.fn(),
  getAllDocuments: vi.fn(),
}));

// Mock React
let refs: Array<{ current: unknown }> = [];
let refCount = 0;
vi.mock('react', () => {
  return {
    useEffect: vi.fn((cb) => {
      cb();
    }),
    useRef: vi.fn((initialValue) => {
      const idx = refCount++;
      if (refs[idx] === undefined) {
        refs[idx] = { current: initialValue };
      }
      return refs[idx];
    }),
  };
});

describe('useAutosave', () => {
  const dispatchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    refs = [];
    refCount = 0;

    vi.mocked(useMarkdown).mockReturnValue({
      state: {
        markdown: '',
        activeDocId: null,
        documents: [],
      } as unknown as MarkdownState,
      dispatch: dispatchMock,
    });
  });

  it('should not save if activeDocId is null', async () => {
    vi.mocked(useMarkdown).mockReturnValue({
      state: {
        markdown: 'hello',
        activeDocId: null,
      } as unknown as MarkdownState,
      dispatch: dispatchMock,
    });

    useAutosave(1000);

    expect(getDocument).not.toHaveBeenCalled();
    expect(saveDocument).not.toHaveBeenCalled();
  });

  it('should initialize and not save if content is unchanged', async () => {
    vi.mocked(useMarkdown).mockReturnValue({
      state: {
        markdown: 'hello',
        activeDocId: 'doc-1',
      } as unknown as MarkdownState,
      dispatch: dispatchMock,
    });

    // Initial render
    useAutosave(1000);

    expect(getDocument).not.toHaveBeenCalled();
    expect(saveDocument).not.toHaveBeenCalled();
  });

  it('should save to IndexedDB and update context when content changes on subsequent render', async () => {
    const mockDoc = {
      id: 'doc-1',
      title: 'Welcome Note',
      content: 'hello',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(getDocument).mockResolvedValue(mockDoc);
    vi.mocked(saveDocument).mockResolvedValue('doc-1');
    vi.mocked(getAllDocuments).mockResolvedValue([mockDoc]);

    // 1. Initial render with 'hello'
    vi.mocked(useMarkdown).mockReturnValue({
      state: {
        markdown: 'hello',
        activeDocId: 'doc-1',
      } as unknown as MarkdownState,
      dispatch: dispatchMock,
    });
    vi.mocked(useDebounce).mockReturnValue('hello');
    useAutosave(1000);

    // Reset refCount so the second render points to the same refs
    refCount = 0;

    // 2. Subsequent render with 'hello world'
    vi.mocked(useMarkdown).mockReturnValue({
      state: {
        markdown: 'hello world',
        activeDocId: 'doc-1',
      } as unknown as MarkdownState,
      dispatch: dispatchMock,
    });
    vi.mocked(useDebounce).mockReturnValue('hello world');
    useAutosave(1000);

    // Wait for the async performSave functions to trigger
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(getDocument).toHaveBeenCalledWith('doc-1');
    expect(saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'doc-1',
        content: 'hello world',
      })
    );
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_LAST_SAVED',
        payload: expect.any(Date),
      })
    );
    expect(getAllDocuments).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'SET_DOCUMENTS',
      payload: [mockDoc],
    });
  });
});
