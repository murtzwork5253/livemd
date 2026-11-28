import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TagInput } from '../../src/components/TagInput/TagInput';

describe('TagInput', () => {
  it('renders existing tags with remove buttons and accessible input', () => {
    const html = renderToStaticMarkup(<TagInput tags={['react', 'notes']} onChange={vi.fn()} />);

    expect(html).toContain('#react');
    expect(html).toContain('#notes');
    expect(html).toContain('aria-label="Remove tag react"');
    expect(html).toContain('aria-label="Remove tag notes"');
    expect(html).toContain('aria-label="Add tag input"');
  });
});
