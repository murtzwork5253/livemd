# LiveMD — Live Markdown Editor

> A production-grade, split-pane Markdown editor built with React 19, TypeScript, and Vite. Features live GitHub-flavored preview, CodeMirror syntax highlighting, IndexedDB multi-document management, automatic saving, starter templates, tags with filtering, ranked full-text search, adjustable reading typography, backend-free document sharing via compressed links, and full version history with a visual diff viewer.

---

## 🎨 Visual Direction

LiveMD is designed around a **Dark Editorial / Developer Tool** aesthetic (VS Code meets Notion). It uses a clean, distraction-free typography system, subtle border highlights, and muted color accents optimized for reading and coding comfort. A light theme is available in Settings.

---

## ✨ Features

- **Split-Pane Editing & Live Preview:** Real-time GitHub-flavored Markdown rendering (`remark-gfm`) with syntax highlighting powered by CodeMirror 6 and highlighted code blocks (`rehype-highlight`). Drag the divider to resize panes.
- **Multi-Document Support:** Create, rename, search, and delete documents stored locally on your device via **IndexedDB** (`idb`), with schema migrations handled across database versions.
- **Starter Templates:** Kick off a new document from a template gallery — blog post, README, meeting notes, technical spec, daily journal, and API documentation — each pre-filled with realistic, date-aware content.
- **Tags & Tag Filtering:** Organize documents with inline hashtag-style tags (type to add, `Enter`/`,` to commit, `Backspace` to remove). Click a tag to filter the sidebar to matching documents.
- **Ranked Search:** Full-text search across titles, tags, and content with relevance ranking — title matches outrank tag matches, which outrank content matches — and an `updatedAt` tie-breaker.
- **Adjustable Reading Typography:** A typography panel lets you tune the preview's font family (serif / sans / mono), font size, line height, and column width; preferences persist across reloads.
- **Autosave & Save Status:** Edits are debounced and saved automatically in the background, with a status bar showing word count, estimated read time, and last-saved time.
- **Version History & Diff Viewer:** Automatic snapshots every 5 minutes plus a snapshot on every manual save. Browse past versions in a side panel, compare them with a **line- and word-level diff viewer**, and restore any version (a safety snapshot is taken automatically before a restore). History is pruned to the 50 most recent snapshots per document to bound storage.
- **Share by Link (No Backend):** Documents are serialized, **gzip-compressed via the browser `CompressionStream` API**, and Base64-encoded directly into a shareable URL — no server required. Opening a shared link shows a read-only preview with an **"Edit Copy"** action to fork it into your own local library.
- **Image Insertion:** Insert images directly into the document as inline Base64 data URLs, with a warning for oversized images (> 500 KB) to prevent document bloat.
- **Table of Contents:** Auto-generated from document headings; click any entry to smoothly scroll the preview to that section.
- **Export Formats:** One-click download of documents to:
  - Raw Markdown source file (`.md`)
  - Styled, self-contained HTML file (`.html`)
  - PDF (`.pdf`) via `html2pdf.js`, with page-break-aware styling
- **Settings Panel:** Theme selection (light/dark) and a full keyboard-shortcut reference.
- **Premium Loading & Empty States:** Animated skeleton shimmers load during database initialization, and a vector empty canvas is displayed if no documents remain.
- **Robust Error Recovery:** Class-based React **Error Boundary** traps rendering or markdown syntax crashes inside the preview, recovering automatically as soon as the user corrects their input.
- **Responsive Layout:** Adapts responsively down to mobile dimensions:
  - **Desktop (> 1024px):** Full-sized split layout with draggable pane resizing.
  - **Tablet (768px - 1024px):** Side-by-side layout with collapsible document sidebar.
  - **Mobile (< 768px):** A segmented pill selector (`Write` vs `Preview`) and a slide-over sidebar drawer overlay.

---

## ⌨️ Keyboard Shortcuts

Speed up your writing workflow with editor hotkeys:

`Ctrl` on Windows/Linux, `Cmd` on macOS.

| Action | Shortcut | Result |
| :--- | :--- | :--- |
| **Bold** | `Ctrl + B` | `**selected text**` |
| *Italic* | `Ctrl + I` | `*selected text*` |
| ~~Strikethrough~~ | `Ctrl + Shift + X` | `~~selected text~~` |
| `Inline code` | `` Ctrl + ` `` | `` `selected text` `` |
| Insert link | `Ctrl + K` | `[selected text](url)` |
| Save document | `Ctrl + S` | Immediate database write + snapshot |
| Toggle sidebar | `Ctrl + Shift + B` (or `Ctrl + \`) | Show/hide document list |
| Editor view | `Ctrl + Alt + 1` (or `Alt + 1`) | Editor-only layout |
| Split view | `Ctrl + Alt + 2` (or `Alt + 2`) | Split editor/preview layout |
| Preview view | `Ctrl + Alt + 3` (or `Alt + 3`) | Preview-only layout |

---

## 🚀 Getting Started

Follow these instructions to run the project locally on your machine.

### Prerequisites

You need [Node.js](https://nodejs.org/) (version 18 or higher recommended) and npm installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/livemd.git
   cd livemd
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 🛠️ Scripts & Commands

The project configures standard development workflows:

- **Run Dev Server:** `npm run dev`
- **TypeScript Compile & Build Bundle:** `npm run build`
- **Lint Codebase:** `npm run lint`
- **Run Prettier Formatter:** `npm run format`
- **Execute Vitest Tests:** `npm run test`

---

## 🏗️ Technical Architecture

LiveMD relies on a modular architecture to keep concerns separated:

```
src/
├── components/
│   ├── Editor/            # CodeMirror wrapper
│   ├── Preview/           # ReactMarkdown renderer + Error Boundary
│   ├── Sidebar/           # Collapsible document list with search + tag filter
│   ├── StatusBar/         # Word count, read time, autosave indicator
│   ├── Toolbar/           # Markdown formatting action buttons
│   ├── TableOfContents/   # Heading outline with click-to-scroll
│   ├── HistoryPanel/      # Version history browser + diff viewer
│   ├── TemplateModal/     # Starter-template gallery for new documents
│   ├── TagInput/          # Inline tag entry with add/remove pills
│   ├── TypographyPanel/   # Reading font, size, line-height, width controls
│   ├── ShareModal/        # Compressed share-link generation
│   ├── ExportModal/       # Markdown / HTML / PDF export picker
│   ├── SettingsModal/     # Theme + keyboard shortcut reference
│   └── ConfirmModal/      # Reusable confirmation dialog
├── context/               # App state (MarkdownContext + markdownReducer)
├── hooks/                 # useAutosave, useDebounce, useDocuments,
│                          #   useVersionHistory, useKeyboardShortcuts, useWordCount
├── lib/                   # db (IndexedDB schema/migrations), export,
│                          #   shareLink (compression), diff, search (ranking),
│                          #   templates, imageUpload, markdownHelpers
├── styles/                # Global variables, typography tokens, light/dark themes
├── App.tsx                # Main workspace coordinator
└── main.tsx               # DOM root mounter
```

### State Management

Application state (documents list, active document, view mode, theme, snapshots, shared-view flag, reading settings, search query, and active tag filter) is managed through a single unified React Context + `useReducer` (`markdownReducer`). Theme, view-mode, and reading-typography preferences are mirrored to `localStorage` so they persist across reloads, while document and snapshot data live in IndexedDB (currently schema version 3).

### How Share-by-Link Works

There is no server. When you share a document, its `{ title, content }` payload is JSON-serialized, streamed through the browser's native `CompressionStream('gzip')`, Base64-encoded, and written to a `?share=` URL parameter (prefixed `v2:` for format versioning, with a legacy uncompressed fallback for backward compatibility). Opening such a URL reverses the process via `DecompressionStream` and renders a read-only preview.

### Version History

`useVersionHistory` writes content snapshots to a dedicated IndexedDB object store — automatically every 5 minutes, and on each manual save — de-duplicating against the last stored content to avoid redundant writes. The `HistoryPanel` diffs versions using a hand-written line + word diff (`lib/diff.ts`) and can restore a prior version, taking a "Before restore" safety snapshot first.

---

## 🧪 Testing

Core logic is covered by [Vitest](https://vitest.dev/) unit tests under `tests/`, including the state reducer, autosave/debounce/keyboard-shortcut/word-count hooks, export helpers, the diff engine, share-link encode/decode, the ranked search, the template library, markdown helpers, and the IndexedDB layer. Run them with `npm run test`.
