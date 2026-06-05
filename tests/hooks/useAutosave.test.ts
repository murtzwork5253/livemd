import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAutosave } from '../../src/hooks/useAutosave';
import { useMarkdown } from '../../src/context/MarkdownContext';
import { useDebounce } from '../../src/hooks/useDebounce';
import type { MarkdownState } from '../../src/context/markdownReducer';

vi.mock('../../src/hooks/useDebounce', () => ({
  useDebounce: vi.fn((val) => val),
}));

vi.mock('../../src/context/MarkdownContext', () => ({
  useMarkdown: vi.fn(),
}));

vi.mock('react', () => {
  return {
    useEffect: vi.fn((cb) => {
      cb();
    }),
  };
});

describe('useAutosave', () => {
  const dispatchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMarkdown).mockReturnValue({
      state: {} as unknown as MarkdownState,
      dispatch: dispatchMock,
    });

    const store: Record<string, string> = {};
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, val) => {
          store[key] = val;
        }),
        removeItem: vi.fn((key) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          for (const k in store) delete store[k];
        }),
        length: 0,
        key: vi.fn((idx) => Object.keys(store)[idx] || null),
      },
      writable: true,
      configurable: true,
    });
  });

  it('should call useDebounce and save to localStorage on effect triggers', () => {
    vi.mocked(useDebounce).mockReturnValueOnce('debounced-content');

    useAutosave('my-key', 'raw-content', 1000);

    expect(useDebounce).toHaveBeenCalledWith('raw-content', 1000);
    expect(localStorage.setItem).toHaveBeenCalledWith('my-key', 'debounced-content');
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_LAST_SAVED',
        payload: expect.any(Date),
      })
    );
  });
});
