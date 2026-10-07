/**
 * Utility functions for exporting markdown content to different formats.
 */

/** Max length for a user-supplied export filename base (before any extension). */
const FILENAME_MAX_CHARS = 200;

/** Characters illegal in filenames on Windows/macOS/Linux. */
const ILLEGAL_FILENAME_CHARS = /[<>:"/\\|?*]/g;

/**
 * Normalizes a user-supplied export filename into a safe base name.
 *
 * This is first-party UI input used only as a local download name / document
 * title, so we normalize (strip filesystem-illegal characters and C0 control
 * codes, collapse whitespace, cap length) rather than rejecting outright.
 * Falls back to `'document'` when nothing usable remains.
 *
 * @param name The raw filename from the input field.
 * @returns A safe, non-empty base filename with no extension enforced.
 */
export function sanitizeExportFilename(name: string): string {
  const cleaned = Array.from(name)
    // Drop C0 control characters (code points 0–31) without embedding raw
    // control bytes in this source file.
    .filter((ch) => ch.codePointAt(0)! > 31)
    .join('')
    .replace(ILLEGAL_FILENAME_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, FILENAME_MAX_CHARS)
    .trim();
  return cleaned || 'document';
}

/**
 * Escapes the five HTML-significant characters so a plain string can be safely
 * embedded inside markup (used for the document `<title>`).
 * @param value The raw string to escape.
 * @returns The escaped string.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
 * Exports rendered HTML content as a PDF using the browser's native print
 * engine.
 *
 * The HTML is rendered into an isolated, off-screen `<iframe>` styled for print
 * and then sent to `window.print()`, letting the user choose "Save as PDF".
 * Because the browser's own layout engine produces the PDF, every character is
 * preserved as real, selectable text — including Unicode, emoji, code blocks,
 * and tables — rather than being rasterized into an image.
 *
 * The print dialog's default filename follows the document `<title>`, so the
 * user's chosen name is used as the suggested filename in Chromium browsers.
 *
 * @param htmlContent The rendered HTML content from the preview.
 * @param title The document title, used as the suggested PDF filename
 *   (defaults to 'document').
 */
export function exportPDFViaPrint(htmlContent: string, title: string = 'document'): void {
  const printTitle = title.trim() || 'document';
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(printTitle)}</title>
  <style>
    @page {
      size: letter;
      margin: 0.5in;
    }
    html, body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      margin: 0;
      color: #1f2328;
      background-color: #ffffff;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 20px;
      margin-bottom: 12px;
      font-weight: 600;
      line-height: 1.25;
      page-break-after: avoid;
    }
    h1 { font-size: 1.8em; padding-bottom: 0.3em; border-bottom: 1px solid #d0d7de; }
    h2 { font-size: 1.4em; padding-bottom: 0.3em; border-bottom: 1px solid #d0d7de; }
    h3 { font-size: 1.2em; }
    p { margin-top: 0; margin-bottom: 12px; }
    a { color: #0969da; text-decoration: none; }
    blockquote {
      padding: 0 1em;
      color: #656d76;
      border-left: 0.25em solid #d0d7de;
      margin: 0 0 12px 0;
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
      padding: 12px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
      margin-bottom: 12px;
      page-break-inside: avoid;
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
      margin-bottom: 12px;
      width: 100%;
      page-break-inside: avoid;
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
      margin: 20px 0;
      background-color: #d0d7de;
      border: 0;
    }
    img {
      max-width: 100%;
      box-sizing: content-box;
      background-color: #ffffff;
      page-break-inside: avoid;
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

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  const cleanup = () => iframe.remove();

  iframe.onload = () => {
    const frameWindow = iframe.contentWindow;
    if (!frameWindow) {
      cleanup();
      return;
    }

    const print = () => {
      frameWindow.focus();
      // `onafterprint` fires once the dialog closes (saved or cancelled).
      frameWindow.onafterprint = cleanup;
      frameWindow.print();
      // Fallback cleanup for browsers that never fire `onafterprint`.
      setTimeout(cleanup, 60000);
    };

    // Wait for fonts to load so glyphs are not substituted in the output.
    const frameFonts = frameWindow.document.fonts;
    if (frameFonts?.ready) {
      frameFonts.ready.then(print, print);
    } else {
      print();
    }
  };

  document.body.appendChild(iframe);
  iframe.srcdoc = fullHtml;
}
