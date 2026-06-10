import { describe, it, expect } from 'vitest';
import { computeDiff } from '../../src/lib/diff';

describe('computeDiff', () => {
  it('should handle identical texts', () => {
    const text = 'line 1\nline 2';
    const diff = computeDiff(text, text);
    expect(diff).toEqual([
      { type: 'unchanged', text: 'line 1' },
      { type: 'unchanged', text: 'line 2' },
    ]);
  });

  it('should handle single line addition', () => {
    const oldText = 'line 1\nline 2';
    const newText = 'line 1\nline 2\nline 3';
    const diff = computeDiff(oldText, newText);
    expect(diff).toEqual([
      { type: 'unchanged', text: 'line 1' },
      { type: 'unchanged', text: 'line 2' },
      { type: 'added', text: 'line 3' },
    ]);
  });

  it('should handle line removal', () => {
    const oldText = 'line 1\nline 2\nline 3';
    const newText = 'line 1\nline 3';
    const diff = computeDiff(oldText, newText);
    expect(diff).toEqual([
      { type: 'unchanged', text: 'line 1' },
      { type: 'removed', text: 'line 2' },
      { type: 'unchanged', text: 'line 3' },
    ]);
  });

  it('should handle replacements as modified lines with word diffs', () => {
    const oldText = 'line 1\nold line\nline 3';
    const newText = 'line 1\nnew line\nline 3';
    const diff = computeDiff(oldText, newText);
    expect(diff).toEqual([
      { type: 'unchanged', text: 'line 1' },
      {
        type: 'modified',
        text: 'new line',
        words: [
          { type: 'removed', text: 'old' },
          { type: 'added', text: 'new' },
          { type: 'unchanged', text: ' ' },
          { type: 'unchanged', text: 'line' },
        ],
      },
      { type: 'unchanged', text: 'line 3' },
    ]);
  });
});
