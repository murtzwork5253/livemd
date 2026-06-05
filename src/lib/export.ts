/**
 * Utility functions for exporting markdown content to different formats.
 */

/**
 * Exports raw markdown text as a downloadable file.
 * @param content The raw markdown content.
 * @param filename The name of the file to save (defaults to 'document.md').
 */
export function exportMarkdown(content: string, filename: string = 'document.md'): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
