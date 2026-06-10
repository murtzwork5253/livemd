import { describe, it, expect } from 'vitest';
import { markdownReducer, initialState, MarkdownAction } from '../../src/context/markdownReducer';

describe('markdownReducer', () => {
  it('should handle SET_MARKDOWN', () => {
    const action: MarkdownAction = { type: 'SET_MARKDOWN', payload: '# Hello World' };
    const state = markdownReducer(initialState, action);
    expect(state.markdown).toBe('# Hello World');
  });

  it('should handle SET_THEME', () => {
    const action: MarkdownAction = { type: 'SET_THEME', payload: 'light' };
    const state = markdownReducer(initialState, action);
    expect(state.theme).toBe('light');
  });

  it('should handle SET_VIEW_MODE', () => {
    const action: MarkdownAction = { type: 'SET_VIEW_MODE', payload: 'preview' };
    const state = markdownReducer(initialState, action);
    expect(state.viewMode).toBe('preview');
  });

  it('should handle TOGGLE_SIDEBAR', () => {
    const action: MarkdownAction = { type: 'TOGGLE_SIDEBAR' };
    const state = markdownReducer({ ...initialState, sidebarOpen: true }, action);
    expect(state.sidebarOpen).toBe(false);
  });

  it('should handle SET_SNAPSHOTS', () => {
    const snapshots = [
      {
        id: 'snap-1',
        docId: 'doc-1',
        content: '# Snap content',
        label: 'Manual Save',
        createdAt: new Date(),
        wordCount: 2,
      },
    ];
    const action: MarkdownAction = { type: 'SET_SNAPSHOTS', payload: snapshots };
    const state = markdownReducer(initialState, action);
    expect(state.snapshots).toEqual(snapshots);
  });
});
