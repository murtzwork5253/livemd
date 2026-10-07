import type { EditorView } from '@codemirror/view';
import { validateImageFile } from './validation';

/**
 * Converts an image file to a base64 Markdown image tag.
 * Rejects any file that fails the strict image schema (must be an `image/*`
 * MIME type within the size limit) before reading it.
 * Calls onLargeImage callback if file size exceeds 500KB.
 */
export function fileToMarkdown(file: File, onLargeImage?: (msg: string) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const check = validateImageFile(file);
    if (!check.ok) {
      reject(new Error(check.error));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_');
      const sizeKB = Math.round(file.size / 1024);

      if (sizeKB > 500 && onLargeImage) {
        onLargeImage(
          `Large image (${(sizeKB / 1024).toFixed(1)}MB) — consider compressing it to prevent document bloat.`,
        );
      }
      resolve(`![${safeName}](${base64})`);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Inserts markdown text at the active CodeMirror cursor location.
 */
export function insertAtCursor(view: EditorView, text: string) {
  const { from } = view.state.selection.main;
  view.dispatch({
    changes: { from, to: from, insert: `\n${text}\n` },
    selection: { anchor: from + text.length + 2 },
  });
  view.focus();
}
export default fileToMarkdown;
