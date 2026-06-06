/**
 * Utility functions for exporting markdown content to different formats.
 */
import html2pdf from 'html2pdf.js';

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

/**
 * Exports rendered HTML content wrapped in a styled HTML skeleton.
 * @param htmlContent The HTML content from the preview container.
 * @param filename The name of the file to save (defaults to 'document.html').
 */
export function exportHTML(htmlContent: string, filename: string = 'document.html'): void {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
      font-size: 16px;
      line-height: 1.5;
      word-wrap: break-word;
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      color: #1f2328;
      background-color: #ffffff;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #d0d7de; }
    h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #d0d7de; }
    h3 { font-size: 1.25em; }
    p { margin-top: 0; margin-bottom: 16px; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    blockquote {
      padding: 0 1em;
      color: #656d76;
      border-left: 0.25em solid #d0d7de;
      margin: 0 0 16px 0;
    }
    code {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
      background-color: rgba(175, 184, 193, 0.2);
      border-radius: 6px;
    }
    pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
      margin-bottom: 16px;
    }
    pre code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
      font-size: 100%;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
      margin-top: 0;
      margin-bottom: 16px;
      width: 100%;
    }
    table th, table td {
      padding: 6px 13px;
      border: 1px solid #d0d7de;
    }
    table th { font-weight: 600; background-color: #f6f8fa; }
    table tr:nth-child(even) { background-color: #f6f8fa; }
    hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: #d0d7de;
      border: 0;
    }
    img {
      max-width: 100%;
      box-sizing: content-box;
      background-color: #ffffff;
    }
    input[type="checkbox"] {
      margin-right: 0.5em;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports DOM element content as a PDF file.
 * @param element The HTMLElement containing the rendered preview.
 * @param filename The name of the PDF file to save (defaults to 'document.pdf').
 * @returns A Promise that resolves when the PDF has been saved.
 */
export async function exportPDF(
  element: HTMLElement,
  filename: string = 'document.pdf',
): Promise<void> {
  const options = {
    margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const },
  };

  await html2pdf().from(element).set(options).save();
}
