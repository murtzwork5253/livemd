import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { useDebounce } from '../../src/hooks/useDebounce';

vi.mock('react', () => {
  return {
    useState: vi.fn((val) => [val, vi.fn()]),
    useEffect: vi.fn(),
  };
});

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize state with value and register effect', () => {
    const setStateMock = vi.fn();
    vi.mocked(React.useState).mockReturnValueOnce(['initial', setStateMock]);

    const debounced = useDebounce('initial', 300);

    expect(debounced).toBe('initial');
    expect(React.useState).toHaveBeenCalledWith('initial');
    expect(React.useEffect).toHaveBeenCalledOnce();
  });

  it('should set timeout on effect call and update state when fired', () => {
    const setStateMock = vi.fn();
    vi.mocked(React.useState).mockReturnValueOnce(['initial', setStateMock]);

    let effectCallback: (() => void | (() => void)) | undefined;
    vi.mocked(React.useEffect).mockImplementationOnce((cb) => {
      effectCallback = cb as () => void | (() => void);
    });

    useDebounce('changed', 300);

    expect(effectCallback).toBeDefined();

    const cleanup = effectCallback!();

    expect(setStateMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(setStateMock).toHaveBeenCalledWith('changed');

    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    if (typeof cleanup === 'function') {
      cleanup();
    }
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
