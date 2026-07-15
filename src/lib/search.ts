import type { Document } from '../context/markdownReducer';

/**
 * Searches and ranks documents based on a search query.
 * Rank rules:
 * - Title matches exact full query gets highest priority.
 * - Title matches individual search terms gets high priority.
 * - Tags matching search terms gets medium priority.
 * - Content matches get low priority.
 */
export function searchDocuments(documents: Document[], query: string): Document[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return documents;

  const terms = trimmed.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return documents;

  // Keep documents that match all search terms in either title, content, or tags
  const filtered = documents.filter((doc) => {
    const title = doc.title.toLowerCase();
    const content = doc.content.toLowerCase();
    const tags = (doc.tags || []).map((t) => t.toLowerCase());

    return terms.every((term) => {
      return title.includes(term) || content.includes(term) || tags.some((t) => t.includes(term));
    });
  });

  // Rank documents
  return filtered.sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, trimmed, terms);
    const scoreB = calculateRelevanceScore(b, trimmed, terms);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // Tie-breaker: Sort by updatedAt descending
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function calculateRelevanceScore(doc: Document, query: string, terms: string[]): number {
  const title = doc.title.toLowerCase();
  const content = doc.content.toLowerCase();
  const tags = (doc.tags || []).map((t) => t.toLowerCase());

  let score = 0;

  // Full title match gets highest score
  if (title.includes(query)) {
    score += 100;
  }

  // Count individual term matches in title
  const titleMatches = terms.filter((term) => title.includes(term)).length;
  score += titleMatches * 10;

  // Count individual term matches in tags
  const tagMatches = terms.filter((term) => tags.some((tag) => tag.includes(term))).length;
  score += tagMatches * 5;

  // Full query match in content gets priority
  if (content.includes(query)) {
    score += 2;
  }

  // Count individual term matches in content
  const contentMatches = terms.filter((term) => content.includes(term)).length;
  score += contentMatches * 1;

  return score;
}

export default searchDocuments;
