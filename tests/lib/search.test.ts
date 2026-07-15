import { describe, it, expect } from 'vitest';
import { searchDocuments } from '../../src/lib/search';
import type { Document } from '../../src/context/markdownReducer';

describe('searchDocuments full-text search and ranking utility', () => {
  const mockDocs: Document[] = [
    {
      id: '1',
      title: 'React basics',
      content: 'This document explains the foundation of React library.',
      tags: ['tutorial', 'javascript'],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: '2',
      title: 'Angular vs Vue guide',
      content: 'Comparing frontend frameworks. React is briefly mentioned.',
      tags: ['frameworks', 'comparison'],
      createdAt: new Date('2026-01-02'),
      updatedAt: new Date('2026-01-02'),
    },
    {
      id: '3',
      title: 'Advanced React patterns',
      content: 'Diving deep into component lifecycle, hooks, and clean React architecture.',
      tags: ['react', 'programming'],
      createdAt: new Date('2026-01-03'),
      updatedAt: new Date('2026-01-03'),
    },
    {
      id: '4',
      title: 'CSS grid cheatsheet',
      content: 'A reference guide for modern CSS grids and flexbox layouts.',
      tags: ['css', 'frontend'],
      createdAt: new Date('2026-01-04'),
      updatedAt: new Date('2026-01-04'),
    },
  ];

  it('should return all documents if query is empty or only spaces', () => {
    expect(searchDocuments(mockDocs, '')).toEqual(mockDocs);
    expect(searchDocuments(mockDocs, '   ')).toEqual(mockDocs);
  });

  it('should filter documents matching all query terms', () => {
    const results = searchDocuments(mockDocs, 'react tutorial');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('1');
  });

  it('should perform case-insensitive search queries', () => {
    const results = searchDocuments(mockDocs, 'aNGUlar');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('2');
  });

  it('should correctly prioritize title matches over tag matches, and tag matches over content matches', () => {
    // Query 'react' matches:
    // - Doc 3: title has 'React', tags has 'react', content has 'React' (score: 100 + 10 + 5 + 2 + 1 = 118)
    // - Doc 1: title has 'React', content has 'React' (score: 100 + 10 + 2 + 1 = 113)
    // - Doc 2: content has 'React' (score: 2 + 1 = 3)
    const results = searchDocuments(mockDocs, 'react');
    expect(results.length).toBe(3);
    expect(results[0].id).toBe('3'); // Advanced React patterns
    expect(results[1].id).toBe('1'); // React basics
    expect(results[2].id).toBe('2'); // Angular vs Vue guide
  });

  it('should rank tag matches above simple content matches', () => {
    // Query 'frontend' matches:
    // - Doc 4: tags has 'frontend' (score: 5)
    // - Doc 2: content has 'frontend' ('frontend frameworks') (score: 2 + 1 = 3)
    const results = searchDocuments(mockDocs, 'frontend');
    expect(results.length).toBe(2);
    expect(results[0].id).toBe('4'); // CSS grid cheatsheet
    expect(results[1].id).toBe('2'); // Angular vs Vue guide
  });

  it('should break ties using updatedAt descending (newest first)', () => {
    const docsWithTies: Document[] = [
      {
        id: 'A',
        title: 'Draft post',
        content: 'Draft content',
        createdAt: new Date('2026-05-01'),
        updatedAt: new Date('2026-05-01'),
      },
      {
        id: 'B',
        title: 'Draft post',
        content: 'Newer Draft content',
        createdAt: new Date('2026-05-02'),
        updatedAt: new Date('2026-05-02'),
      },
    ];

    const results = searchDocuments(docsWithTies, 'draft');
    expect(results.length).toBe(2);
    expect(results[0].id).toBe('B'); // Newer doc B comes first
    expect(results[1].id).toBe('A');
  });
});
