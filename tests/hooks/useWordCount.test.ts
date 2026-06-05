import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { useWordCount } from '../../src/hooks/useWordCount';

vi.mock('react', () => {
  return {
    useMemo: vi.fn((fn) => fn()),
  };
});

describe('useWordCount', () => {
  it('should return 0 for empty markdown', () => {
    const result = useWordCount('');
    expect(result.wordCount).toBe(0);
    expect(result.charCount).toBe(0);
    expect(result.readTime).toBe(0);
    expect(React.useMemo).toHaveBeenCalled();
  });

  it('should calculate counts correctly', () => {
    const result = useWordCount('Hello world! This is a test.');
    expect(result.wordCount).toBe(6);
    expect(result.charCount).toBe(28);
    expect(result.readTime).toBe(1);
  });

  it('should estimate read time for long documents', () => {
    const longText = Array(250).fill('word').join(' ');
    const result = useWordCount(longText);
    expect(result.wordCount).toBe(250);
    expect(result.readTime).toBe(2);
  });
});
