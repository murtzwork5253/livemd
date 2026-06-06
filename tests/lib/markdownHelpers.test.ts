import { describe, it, expect } from 'vitest';
import { slugify, extractHeadings } from '../../src/lib/markdownHelpers';

describe('markdownHelpers', () => {
  describe('slugify', () => {
    it('should convert text to lowercase and replace spaces with hyphens', () => {
      expect(slugify('My Heading')).toBe('my-heading');
      expect(slugify('  Spaced  Title ')).toBe('spaced-title');
    });

    it('should strip out special characters and punctuation', () => {
      expect(slugify('Heading #1!')).toBe('heading-1');
      expect(slugify('Hello, World?')).toBe('hello-world');
      expect(slugify('Code block: `const x = 5;`')).toBe('code-block-const-x-5');
    });

    it('should handle underscores and duplicate dashes', () => {
      expect(slugify('some_random_title')).toBe('some-random-title');
      expect(slugify('multiple---dashes')).toBe('multiple-dashes');
    });
  });

  describe('extractHeadings', () => {
    it('should return an empty array for empty or empty markdown', () => {
      expect(extractHeadings('')).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(extractHeadings(null as any)).toEqual([]);
    });

    it('should parse simple headings correctly', () => {
      const md = `
# Title
Some text here.
## Subtitle
More text.
### Sub-subtitle
`;
      const result = extractHeadings(md);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ level: 1, text: 'Title', id: 'title' });
      expect(result[1]).toEqual({ level: 2, text: 'Subtitle', id: 'subtitle' });
      expect(result[2]).toEqual({ level: 3, text: 'Sub-subtitle', id: 'sub-subtitle' });
    });

    it('should generate unique ids for duplicate headings', () => {
      const md = `
# Heading
## Heading
### Heading
`;
      const result = extractHeadings(md);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('heading');
      expect(result[1].id).toBe('heading-1');
      expect(result[2].id).toBe('heading-2');
    });

    it('should ignore headings inside code blocks', () => {
      const md = `
# Real Heading

\`\`\`markdown
# Fake Heading In Code Block
## Another Fake Heading
\`\`\`

## Another Real Heading
`;
      const result = extractHeadings(md);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ level: 1, text: 'Real Heading', id: 'real-heading' });
      expect(result[1]).toEqual({ level: 2, text: 'Another Real Heading', id: 'another-real-heading' });
    });
  });
});
