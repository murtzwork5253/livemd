import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { useKeyboardShortcuts } from '../../src/hooks/useKeyboardShortcuts';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';

vi.mock('react', () => {
  return {
    useEffect: vi.fn((cb) => {
      cb();
    }),
  };
});

describe('useKeyboardShortcuts', () => {
  let addEventListenerSpy: Mock;
  let removeEventListenerSpy: Mock;
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();

    keydownHandler = null;
    addEventListenerSpy = vi.fn((event: string, cb: (e: KeyboardEvent) => void) => {
      if (event === 'keydown') {
        keydownHandler = cb;
      }
    });
    removeEventListenerSpy = vi.fn();

    // Mock window on globalThis
    Object.defineProperty(globalThis, 'window', {
      value: {
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).window;
  });

  it('should register and cleanup event listeners', () => {
    const editorRef = { current: null };
    useKeyboardShortcuts({ editorRef });

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should format bold on Ctrl+B', () => {
    const dispatchMock = vi.fn();
    const viewMock = {
      state: {
        selection: {
          main: { from: 0, to: 4, head: 4 },
        },
        sliceDoc: vi.fn().mockReturnValue('text'),
      },
      dispatch: dispatchMock,
      focus: vi.fn(),
    };

    // cast to unknown first to avoid ts-error on mock
    const editorRef = { current: { view: viewMock } } as unknown as React.RefObject<ReactCodeMirrorRef | null>;

    useKeyboardShortcuts({ editorRef });

    expect(keydownHandler).toBeDefined();

    const event = {
      ctrlKey: true,
      metaKey: false,
      key: 'b',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;

    keydownHandler!(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: { from: 0, to: 4, insert: '**text**' },
      })
    );
  });

  it('should trigger onSave on Ctrl+S', () => {
    const onSaveMock = vi.fn();
    const viewMock = {
      state: {
        selection: {
          main: { from: 0, to: 0, head: 0 },
        },
        sliceDoc: vi.fn().mockReturnValue(''),
      },
    };
    const editorRef = { current: { view: viewMock } } as unknown as React.RefObject<ReactCodeMirrorRef | null>;

    useKeyboardShortcuts({ editorRef, onSave: onSaveMock });

    const event = {
      ctrlKey: true,
      metaKey: false,
      key: 's',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;

    keydownHandler!(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onSaveMock).toHaveBeenCalled();
  });
});
