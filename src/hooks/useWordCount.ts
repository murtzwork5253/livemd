import { useMemo } from 'react';

export function useWordCount(markdown: string) {
  return useMemo(() => {
    const cleanMarkdown = markdown.trim();
    if (!cleanMarkdown) {
      return {
        wordCount: 0,
        charCount: 0,
        readTime: 0,
      };
    }
    const words = cleanMarkdown.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = markdown.length;
    const readTime = Math.ceil(wordCount / 200);

    return {
      wordCount,
      charCount,
      readTime,
    };
  }, [markdown]);
}
