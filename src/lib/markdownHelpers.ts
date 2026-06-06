/**
 * Converts text into a clean, URL/anchor-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-alphanumeric characters except spaces and hyphens
    .replace(/[\s_]+/g, '-') // replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // collapse multiple consecutive hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

export interface HeadingItem {
  level: number;
  text: string;
  id: string;
}

/**
 * Extracts headings from a markdown string, ignoring code blocks.
 */
export function extractHeadings(markdown: string): HeadingItem[] {
  if (!markdown) return [];

  // Strip code blocks to avoid false heading matches
  const cleanedMarkdown = markdown.replace(/```[\s\S]*?```/g, '');

  const regex = /^(#{1,6})\s+(.+)$/gm;
  const headings: HeadingItem[] = [];
  let match;
  const slugsCount: Record<string, number> = {};

  while ((match = regex.exec(cleanedMarkdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    let slug = slugify(text);

    if (slugsCount[slug] !== undefined) {
      slugsCount[slug]++;
      slug = `${slug}-${slugsCount[slug]}`;
    } else {
      slugsCount[slug] = 0;
    }

    headings.push({ level, text, id: slug });
  }

  return headings;
}
export default extractHeadings;
