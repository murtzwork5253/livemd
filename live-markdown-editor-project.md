# Live Markdown Editor — Comprehensive Project Document

> A production-grade, split-pane Markdown editor built with React.js. Real-time preview, syntax highlighting, export capabilities, and a polished developer-focused UI.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design Inspiration & Visual Direction](#2-design-inspiration--visual-direction)
3. [Tech Stack](#3-tech-stack)
4. [Project Methodology](#4-project-methodology)
5. [Phase 1 — Foundation](#5-phase-1--foundation)
6. [Phase 2 — Editor Quality](#6-phase-2--editor-quality)
7. [Phase 3 — Standout Features](#7-phase-3--standout-features)
8. [Phase 4 — Polish & Deploy](#8-phase-4--polish--deploy)
9. [Phase 5 — New Features](#9-phase-5--new-features)
   - [5A — Focus Mode](#5a-focus--distraction-free-mode)
   - [5B — Version History](#5b-version-history--snapshots)
   - [5C — Find & Replace](#5c-find--replace)
   - [5D — AI Writing Assistant](#5d-ai-writing-assistant)
   - [5E — AI Title Generator](#5e-ai-document-title-generator)
   - [5F — Share by Link](#5f-share-by-link-read-only)
   - [5G — Publish as GitHub Gist](#5g-publish-as-github-gist)
   - [5H — Command Palette](#5h-command-palette)
   - [5I — Document Templates](#5i-document-templates)
   - [5J — Drag & Drop Image Upload](#5j-drag--drop-image-upload)
   - [5K — Reading Mode](#5k-reading-mode-with-typography-settings)
   - [5L — Tags & Full-Text Search](#5l-tags--full-text-document-search)
10. [Updated Folder Structure](#10-updated-folder-structure)
11. [Updated State Architecture](#11-updated-state-architecture)
12. [Database & Storage Strategy](#12-database--storage-strategy)
13. [Scalability Considerations](#13-scalability-considerations)
14. [Performance Checklist](#14-performance-checklist)
15. [Accessibility Checklist](#15-accessibility-checklist)
16. [Deployment](#16-deployment)

---

## 1. Project Overview

| Field | Detail |
|---|---|
| **Project Name** | LiveMD — Live Markdown Editor |
| **Type** | Frontend Web Application |
| **Framework** | React 18 + Vite |
| **Target Users** | Developers, technical writers, students |
| **Portfolio Goal** | Showcase custom hooks, context API, third-party integrations, performance patterns |
| **Timeline** | 4–5 weeks (solo developer) |

### What Makes This Portfolio-Worthy

- `useDebounce` custom hook demonstrates performance awareness
- Context API + `useReducer` shows scalable state management beyond `useState`
- CodeMirror integration shows ability to work with complex third-party libraries
- Export to PDF/HTML shows cross-library problem solving
- The finished product is genuinely useful — visitors will actually try it

---

## 2. Design Inspiration & Visual Direction

### Chosen Aesthetic: **Dark Editorial / Developer Tool**

Inspired by the aesthetic of professional developer tools. Think VS Code meets Notion — dark canvas, monospaced accents, clean sidebar, minimal chrome.

### Inspiration References

| Source | URL | What to Take From It |
|---|---|---|
| **Typora** (desktop Markdown editor) | https://typora.io | Seamless preview toggling, distraction-free mode, toolbar layout |
| **Obsidian UI patterns** | https://obsidian.md | Dark sidebar, file tree design, monospace feel |
| **Vercel Dashboard** | https://vercel.com/dashboard | Clean dark UI, subtle borders, muted color accents |
| **Charm.sh CLI branding** | https://charm.sh | Typography-first design with monospaced fonts, terminal aesthetic |
| **Panda Syntax theme (CodePen)** | https://codepen.io/search/pens?q=markdown+editor | Live split-pane editor layout patterns |
| **Linear App** | https://linear.app | Keyboard-shortcut-first UX, command palette design |
| **Dribbble — "Markdown Editor UI"** | https://dribbble.com/search/markdown-editor | Visual UI references for toolbar and layout |
| **Behance — Developer Tool UI** | https://www.behance.net/search/projects/developer+tool+ui | Color palette and component layout ideas |

### Color Palette

```css
:root {
  --bg-primary:    #0d1117;   /* GitHub dark — main canvas */
  --bg-secondary:  #161b22;   /* Sidebar and panels */
  --bg-elevated:   #21262d;   /* Toolbar, hover states */
  --border:        #30363d;   /* Subtle dividers */
  --text-primary:  #e6edf3;   /* Main body text */
  --text-muted:    #8b949e;   /* Line numbers, hints */
  --accent-blue:   #58a6ff;   /* Links, active states */
  --accent-green:  #3fb950;   /* Success, word count */
  --accent-orange: #f0883e;   /* Warnings, headings */
  --accent-purple: #bc8cff;   /* Syntax highlight — keywords */
}
```

### Typography

```css
/* Display / Toolbar labels */
font-family: 'Geist', 'Inter', sans-serif;

/* Editor textarea */
font-family: 'JetBrains Mono', 'Fira Code', monospace;

/* Preview rendered output */
font-family: 'Lora', 'Georgia', serif;  /* Reading comfort */
```

> Load fonts from Google Fonts (free):
> - [Geist](https://fonts.google.com/specimen/Geist)
> - [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
> - [Lora](https://fonts.google.com/specimen/Lora)

---

## 3. Tech Stack

### Core

| Layer | Technology | Why |
|---|---|---|
| **Framework** | React 18 | Component model, hooks ecosystem |
| **Build Tool** | Vite 5 | Fast HMR, simple config, modern defaults |
| **Language** | JavaScript (or TypeScript) | TypeScript recommended for portfolio credibility |
| **Styling** | CSS Modules + CSS Variables | Scoped styles, no runtime overhead |

### Editor

| Library | Version | Purpose |
|---|---|---|
| `@uiw/react-codemirror` | ^4.x | Rich code editor with Markdown support |
| `@codemirror/lang-markdown` | ^6.x | Markdown language extension |
| `@codemirror/theme-one-dark` | ^6.x | Dark editor theme |

### Preview & Parsing

| Library | Version | Purpose |
|---|---|---|
| `react-markdown` | ^9.x | Markdown → React component tree |
| `remark-gfm` | ^4.x | GitHub Flavored Markdown (tables, checkboxes) |
| `rehype-highlight` | ^7.x | Syntax highlighting in code blocks |
| `react-syntax-highlighter` | ^15.x | Alternative/supplemental code highlighting |

### Export

| Library | Version | Purpose |
|---|---|---|
| `html2pdf.js` | ^0.10.x | Client-side PDF export (no server needed) |
| Native `Blob` API | — | `.md` and `.html` file downloads |

### Storage (Phase 1 → Scale)

| Phase | Technology | Why |
|---|---|---|
| **Phase 1** | `localStorage` | Zero setup, works offline, sufficient for MVP |
| **Phase 2** | `IndexedDB` (via `idb` library) | Handles large documents, multiple files |
| **Phase 3+** | Firebase Firestore (free tier) | Multi-device sync, user accounts, cloud backup |

### Utilities

| Library | Purpose |
|---|---|
| `use-debounce` | Debounce preview rendering (or write your own) |
| `date-fns` | Format timestamps for autosave display |
| `nanoid` | Generate unique document IDs |

### Dev Tools

| Tool | Purpose |
|---|---|
| ESLint + Prettier | Code quality and formatting |
| Vitest | Unit testing (custom hooks) |
| React DevTools | State inspection |

### Full Install Command

```bash
npm create vite@latest livemd -- --template react
cd livemd
npm install react-markdown remark-gfm rehype-highlight
npm install @uiw/react-codemirror @codemirror/lang-markdown @codemirror/theme-one-dark
npm install react-syntax-highlighter html2pdf.js
npm install idb nanoid date-fns
npm install -D eslint prettier vitest
```

---

## 4. Project Methodology

### Framework: Agile Micro-Sprints

Since this is a solo portfolio project, use a lightweight Agile approach: 1-week sprints, each delivering a shippable increment.

```
Week 1  →  Phase 1: Foundation (working split pane, live preview)
Week 2  →  Phase 2: Editor Quality (toolbar, shortcuts, word count)
Week 3  →  Phase 3: Standout Features (export, themes, file management)
Week 4  →  Phase 4: Polish, testing, deploy
Week 5  →  Buffer / stretch goals (Firebase sync, command palette)
```

### Git Branching Strategy

```
main                  ← always deployable
  └── dev             ← integration branch
        ├── feat/split-pane
        ├── feat/toolbar
        ├── feat/export-pdf
        └── fix/debounce-lag
```

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org):

```
feat: add useDebounce hook for preview rendering
fix: prevent toolbar from wrapping on small screens
refactor: extract StatusBar into separate component
docs: update README with keyboard shortcuts
```

### Kanban Board (free tools)

Use one of these to track tasks:
- [GitHub Projects](https://github.com/features/project-management) — free, integrates with your repo
- [Trello](https://trello.com) — free tier, visual boards
- [Linear](https://linear.app) — free for solo developers, excellent UX

**Columns:** `Backlog` → `This Week` → `In Progress` → `Review` → `Done`

### Definition of Done (per feature)

A feature is complete when:
- [ ] Component renders without console errors
- [ ] Works in Chrome, Firefox, and Safari
- [ ] Responsive at 768px and 1280px viewports
- [ ] Edge cases handled (empty input, very long content)
- [ ] Unit test written for any custom hook
- [ ] All validation commands run (lint, format, build/type-check, security audit, and tests) for safety, security, and a vibe-coded codebase
- [ ] Feature branch created, pushed, and merged/PR'd into main after all verification and security checks pass


---

## 5. Phase 1 — Foundation

**Goal:** A working split-pane editor with live preview and autosave.  
**Duration:** Week 1  
**Deliverable:** Deployed MVP on Vercel

### Tasks

#### 1.1 Project Bootstrap

```bash
npm create vite@latest livemd -- --template react-ts
cd livemd && npm install
```

- Set up folder structure (see Section 9)
- Configure ESLint and Prettier
- Add base CSS variables (color palette from Section 2)
- Set up Google Fonts imports

#### 1.2 Context + Reducer Setup

Create `MarkdownContext` with `useReducer`. This is the core state layer:

```js
// State shape
{
  markdown: string,       // Raw markdown content
  theme: 'light' | 'dark',
  viewMode: 'editor' | 'split' | 'preview',
  wordCount: number,
  lastSaved: Date | null,
  documents: Document[],  // For later multi-file support
  activeDocId: string
}
```

Actions: `SET_MARKDOWN`, `SET_THEME`, `SET_VIEW_MODE`, `SAVE_DOCUMENT`, `LOAD_DOCUMENT`

#### 1.3 Split Pane Layout

- CSS Grid layout: `grid-template-columns: 1fr 1fr`
- Resizable divider using `mousedown` + `mousemove` events
- View mode toggle collapses/expands panes

#### 1.4 CodeMirror Editor Pane

```jsx
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

<CodeMirror
  value={state.markdown}
  extensions={[markdown()]}
  theme={oneDark}
  onChange={(value) => dispatch({ type: 'SET_MARKDOWN', payload: value })}
/>
```

#### 1.5 Preview Pane

```jsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {debouncedMarkdown}
</ReactMarkdown>
```

#### 1.6 useDebounce Custom Hook

```js
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

#### 1.7 localStorage Autosave

```js
// hooks/useAutosave.js
import { useEffect } from 'react';

export function useAutosave(key, value, delay = 1000) {
  const debouncedValue = useDebounce(value, delay);
  useEffect(() => {
    localStorage.setItem(key, debouncedValue);
  }, [key, debouncedValue]);
}
```

#### 1.8 Deploy to Vercel

```bash
npm run build
# Push to GitHub, connect repo on vercel.com — done
```

---

## 6. Phase 2 — Editor Quality

**Goal:** Make the editor feel professional.  
**Duration:** Week 2

### Tasks

#### 2.1 Toolbar Component

Buttons that wrap selected text in markdown syntax:

| Button | Action | Keyboard Shortcut |
|---|---|---|
| **B** | `**selected**` | Ctrl+B |
| *I* | `*selected*` | Ctrl+I |
| ~~S~~ | `~~selected~~` | Ctrl+Shift+X |
| `</>` | `` `selected` `` | Ctrl+` |
| H1–H3 | Prepend `# ` to line | — |
| Link | `[selected](url)` | Ctrl+K |
| Image | `![alt](url)` | — |
| Quote | Prepend `> ` | — |

Use the CodeMirror `EditorView` ref to get/set selections programmatically.

#### 2.2 Keyboard Shortcuts

Register shortcuts globally using `useEffect` on `keydown`:

```js
useEffect(() => {
  const handler = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); wrapSelection('**', '**'); }
      if (e.key === 'i') { e.preventDefault(); wrapSelection('*', '*'); }
      if (e.key === 's') { e.preventDefault(); triggerSave(); }
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, []);
```

#### 2.3 StatusBar Component

Display at bottom of editor:

- Word count: `markdown.split(/\s+/).filter(Boolean).length`
- Character count: `markdown.length`
- Estimated read time: `Math.ceil(wordCount / 200)` minutes
- Autosave status: "Saved 3 seconds ago" (using `date-fns`)
- Current line/column number (from CodeMirror state)

#### 2.4 Theme Toggle

Toggle between light and dark CSS variable sets. Persist preference in `localStorage`.

```js
document.documentElement.setAttribute('data-theme', theme);
```

Use CSS `[data-theme="light"]` and `[data-theme="dark"]` attribute selectors.

#### 2.5 View Mode Toggle

Three buttons in the header:
- `Editor` — hide preview, full width editor
- `Split` — 50/50 layout (default)
- `Preview` — hide editor, full width preview (reading mode)

---

## 7. Phase 3 — Standout Features

**Goal:** Features that make the project memorable.  
**Duration:** Week 3

### Tasks

#### 3.1 Export to Markdown File

```js
function exportMarkdown(content, filename = 'document.md') {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

#### 3.2 Export to HTML File

```js
function exportHTML(htmlContent) {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Exported Document</title>
  <style>body { font-family: Georgia, serif; max-width: 720px; margin: 2rem auto; }</style>
</head>
<body>${htmlContent}</body>
</html>`;
  const blob = new Blob([fullHtml], { type: 'text/html' });
  // ... same download pattern
}
```

#### 3.3 Export to PDF

```js
import html2pdf from 'html2pdf.js';

function exportPDF() {
  const element = document.getElementById('preview-pane');
  html2pdf().from(element).set({
    margin: 1,
    filename: 'document.pdf',
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  }).save();
}
```

#### 3.4 Multi-Document Support (using IndexedDB)

```js
// lib/db.js — using the 'idb' library
import { openDB } from 'idb';

export const db = openDB('livemd', 1, {
  upgrade(db) {
    db.createObjectStore('documents', { keyPath: 'id' });
  }
});

export async function saveDocument(doc) {
  return (await db).put('documents', doc);
}

export async function getAllDocuments() {
  return (await db).getAll('documents');
}
```

Each document has shape:
```js
{
  id: nanoid(),
  title: string,
  content: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3.5 Document Sidebar

Collapsible left sidebar listing all saved documents. Features:
- Click to open document
- Rename on double-click
- Delete with confirmation
- "New Document" button
- Search/filter documents by title

#### 3.6 Table of Contents Panel

Parse headings from markdown in real-time and render a floating TOC. Click a heading to scroll to it in the preview.

```js
function extractHeadings(markdown) {
  const regex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    headings.push({ level: match[1].length, text: match[2] });
  }
  return headings;
}
```

---

## 8. Phase 4 — Polish & Deploy

**Goal:** Production-ready quality.  
**Duration:** Week 4

### Tasks

#### 4.1 Responsive Design

| Breakpoint | Behaviour |
|---|---|
| `> 1024px` | Full split-pane layout |
| `768px–1024px` | Collapsible sidebar, split pane |
| `< 768px` | Tab-based: Editor tab / Preview tab |

#### 4.2 Loading & Empty States

- Skeleton loader while IndexedDB initializes
- Empty state illustration when no documents exist ("Start writing...")
- Spinner on PDF export (can take 1–3 seconds)

#### 4.3 Error Boundaries

Wrap the preview pane in a React Error Boundary. Malformed markdown should never crash the app.

#### 4.4 Unit Tests (Vitest)

Write tests for custom hooks:

```js
// hooks/useDebounce.test.js
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

test('returns debounced value after delay', async () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
    initialProps: { value: 'hello' }
  });
  rerender({ value: 'world' });
  expect(result.current).toBe('hello'); // still old value
  act(() => vi.advanceTimersByTime(300));
  expect(result.current).toBe('world'); // now updated
});
```

#### 4.5 README

Write a thorough README.md for your GitHub repo:
- Live demo link (Vercel URL)
- Feature list with GIF screenshots
- Local setup instructions
- Architecture overview (link back to this doc)
- Keyboard shortcuts reference

#### 4.6 Final Deployment (Vercel)

```bash
# Verify build passes
npm run build

# Environment variables (if using Firebase later)
# Add to Vercel dashboard: Settings → Environment Variables

# Deploy
git push origin main  # Auto-deploys via Vercel GitHub integration
```

---

## 9. Phase 5 — New Features

**Goal:** Elevate LiveMD from a portfolio project into a genuinely useful product.  
**Duration:** 4–6 weeks (pick features based on priority — see each task for effort estimate)  
**Prerequisite:** All of Phases 1–4 complete and deployed.

Each feature below is self-contained — it can be built in any order. Each section includes: what it is, why it matters, new libraries, state changes needed, full task list, and code scaffolding.

---

### Feature Overview Table

| # | Feature | Category | Effort | Depends On |
|---|---|---|---|---|
| 5A | Focus / distraction-free mode | UX | ~1 day | Phase 2 (view modes) |
| 5B | Version history & snapshots | Productivity | ~3 days | Phase 3 (IndexedDB) |
| 5C | Find & replace | Productivity | ~1 day | Phase 1 (CodeMirror) |
| 5D | AI writing assistant | AI | ~4 days | Groq API (free) |
| 5E | AI document title generator | AI | ~1 day | 5D (Groq setup) |
| 5F | Share by link | Sharing | ~1 day | Phase 1 (URL API) |
| 5G | Publish as GitHub Gist | Sharing | ~3 days | Phase 3 (multi-doc) |
| 5H | Command palette | Power user | ~5 days | All phases |
| 5I | Document templates | Power user | ~1 day | Phase 3 (multi-doc) |
| 5J | Drag & drop image upload | UX | ~2 days | Phase 1 (CodeMirror) |
| 5K | Reading mode + typography | UX | ~1 day | Phase 2 (view modes) |
| 5L | Tags & full-text search | Productivity | ~3 days | Phase 3 (IndexedDB) |

---

### New Libraries for Phase 5

```bash
# AI features (5D, 5E)
npm install groq-sdk

# Command palette (5H)
npm install cmdk

# No new libraries needed for: 5A, 5B, 5C, 5F, 5G, 5I, 5J, 5K, 5L
# They use browser-native APIs or libraries already in the project
```

---

## 5A. Focus / Distraction-Free Mode

**Category:** UX  |  **Effort:** ~1 day  |  **Difficulty:** Easy

### What it is
A full-screen writing mode that hides the toolbar, sidebar, status bar, and all chrome. Only the text editor canvas remains. Press `Esc` or `F11` to exit. Inspired by iA Writer and Typora's focus mode.

### Why it matters
Writers and technical authors actively seek this. It signals the app takes writing seriously — not just editing. It's also visually impressive in a portfolio demo.

### No new libraries needed
Uses the native `Fullscreen API` + CSS transitions.

### State changes
Add one field to context:

```js
// Add to initialState in MarkdownContext.jsx
focusMode: false,

// Add to reducer
case 'TOGGLE_FOCUS_MODE':
  return { ...state, focusMode: !state.focusMode };
```

### Tasks

#### 5A.1 — Fullscreen API integration
```js
// lib/focusMode.js
export function enterFocusMode() {
  document.documentElement.requestFullscreen?.();
}

export function exitFocusMode() {
  if (document.fullscreenElement) {
    document.exitFullscreen?.();
  }
}
```

#### 5A.2 — CSS focus mode layout
```css
/* In globals.css */
[data-focus-mode="true"] .toolbar,
[data-focus-mode="true"] .sidebar,
[data-focus-mode="true"] .status-bar,
[data-focus-mode="true"] .header {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

[data-focus-mode="true"] .editor-layout {
  grid-template-columns: 1fr;  /* Hide preview pane too */
}

[data-focus-mode="true"] .codemirror-wrap {
  max-width: 720px;
  margin: 0 auto;
  padding: 4rem 2rem;
  font-size: 18px;
  line-height: 1.9;
}
```

#### 5A.3 — Keyboard shortcut
```js
// Add to useKeyboardShortcuts.js
if (e.key === 'F11' || (e.ctrlKey && e.key === 'Enter')) {
  e.preventDefault();
  dispatch({ type: 'TOGGLE_FOCUS_MODE' });
}
// Exit on Escape
if (e.key === 'Escape' && state.focusMode) {
  dispatch({ type: 'TOGGLE_FOCUS_MODE' });
}
```

#### 5A.4 — Exit hint overlay
Show a faint tooltip at the bottom of the screen: `"Press Esc to exit focus mode"`. Fade it out after 3 seconds using `setTimeout`.

#### 5A.5 — Toolbar button
Add a `Ctrl+Enter` / `F11` button to the toolbar with a focus icon. Update the keyboard shortcuts reference in README.

### Definition of Done
- [ ] Toolbar, sidebar, status bar all hidden in focus mode
- [ ] Full-screen API engaged
- [ ] Esc exits focus mode
- [ ] Exit hint fades in and out
- [ ] Works on both light and dark theme
- [ ] Toolbar button toggles it

---

## 5B. Version History / Snapshots

**Category:** Productivity  |  **Effort:** ~3 days  |  **Difficulty:** Medium

### What it is
The app automatically saves a snapshot of the document every 5 minutes (and on manual Ctrl+S) into IndexedDB. A "History" panel in the sidebar shows a timeline of snapshots. Clicking any snapshot shows a diff view and lets the user restore that version.

### Why it matters
Data safety is a professional concern. This feature shows you think beyond the happy path — it's the kind of thing senior developers notice.

### No new libraries needed
Uses IndexedDB (already in project) + a simple diff algorithm written from scratch.

### New IndexedDB object store

```js
// Update lib/db.js — bump DB version to 2
export const db = openDB('livemd', 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore('documents', { keyPath: 'id' });
    }
    if (oldVersion < 2) {
      // New store for snapshots
      const snapStore = db.createObjectStore('snapshots', { keyPath: 'id' });
      snapStore.createIndex('docId', 'docId');
      snapStore.createIndex('createdAt', 'createdAt');
    }
  }
});
```

### Snapshot data shape

```js
{
  id: nanoid(),
  docId: string,           // Parent document ID
  content: string,         // Full markdown at time of snapshot
  label: string,           // e.g. "Auto-save" or "Manual save"
  createdAt: Date,
  wordCount: number
}
```

### Tasks

#### 5B.1 — Snapshot save functions
```js
// lib/db.js — add these functions
export async function saveSnapshot(snapshot) {
  return (await db).add('snapshots', snapshot);
}

export async function getSnapshotsForDoc(docId) {
  const index = (await db).transaction('snapshots').store.index('docId');
  return index.getAll(docId);
}

export async function deleteSnapshot(id) {
  return (await db).delete('snapshots', id);
}

// Keep only last 50 snapshots per document to avoid storage bloat
export async function pruneSnapshots(docId, keep = 50) {
  const all = await getSnapshotsForDoc(docId);
  const sorted = all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const toDelete = sorted.slice(keep);
  await Promise.all(toDelete.map(s => deleteSnapshot(s.id)));
}
```

#### 5B.2 — useVersionHistory hook
```js
// hooks/useVersionHistory.js
import { useEffect, useRef } from 'react';
import { saveSnapshot, pruneSnapshots } from '../lib/db';
import { nanoid } from 'nanoid';

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useVersionHistory(docId, content, wordCount) {
  const intervalRef = useRef(null);

  const createSnapshot = async (label = 'Auto-save') => {
    if (!docId || !content.trim()) return;
    await saveSnapshot({
      id: nanoid(),
      docId,
      content,
      label,
      createdAt: new Date().toISOString(),
      wordCount
    });
    await pruneSnapshots(docId, 50);
  };

  // Auto-snapshot every 5 minutes
  useEffect(() => {
    intervalRef.current = setInterval(() => createSnapshot('Auto-save'), INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [docId, content]);

  return { createSnapshot };
}
```

#### 5B.3 — HistoryPanel component
New component at `src/components/HistoryPanel/HistoryPanel.jsx`:
- Renders as a slide-in panel from the right side
- Lists snapshots sorted newest-first
- Each row shows: timestamp (via `date-fns`), label, word count
- "Restore" button on each row
- "Delete" button to remove a snapshot

#### 5B.4 — Simple diff view
On snapshot hover/click, show a side-by-side diff highlighting added lines (green) and removed lines (red). Implement a basic line-level diff without a library:

```js
// lib/diff.js
export function diffLines(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  // Return array of { type: 'added'|'removed'|'unchanged', text }
  // Simple approach: compare line by line, mark changes
  return newLines.map((line, i) => ({
    type: oldLines[i] === undefined ? 'added'
        : oldLines[i] !== line ? 'changed'
        : 'unchanged',
    text: line
  }));
}
```

#### 5B.5 — Manual snapshot on Ctrl+S
```js
// In useKeyboardShortcuts.js — update the save handler
if (e.key === 's') {
  e.preventDefault();
  triggerSave();
  createSnapshot('Manual save'); // call from useVersionHistory
}
```

#### 5B.6 — History button in header
Add a clock/history icon button to the top toolbar. Clicking toggles the HistoryPanel.

### Definition of Done
- [ ] Auto-snapshot fires every 5 minutes
- [ ] Manual snapshot fires on Ctrl+S
- [ ] Max 50 snapshots per doc (older ones pruned)
- [ ] HistoryPanel lists all snapshots with timestamps
- [ ] Clicking any snapshot shows a diff view
- [ ] "Restore" replaces current editor content
- [ ] "Delete" removes a snapshot with confirmation

---

## 5C. Find & Replace

**Category:** Productivity  |  **Effort:** ~1 day  |  **Difficulty:** Easy

### What it is
`Ctrl+F` opens a floating search bar at the top of the editor pane. It highlights all matches in the CodeMirror editor. `Ctrl+H` expands to show a replace field. Navigate between matches with Enter / Shift+Enter.

### Why it matters
It's a basic feature users expect in any text editor. Its absence is more noticeable than its presence. Fortunately it's almost free — CodeMirror ships the search extension bundled.

### No new libraries needed
`@codemirror/search` is already included in the CodeMirror 6 bundle.

### Tasks

#### 5C.1 — Enable CodeMirror search extension
```js
// In EditorPane.jsx — add to extensions array
import { search, searchKeymap } from '@codemirror/search';
import { keymap } from '@codemirror/view';

const extensions = [
  markdown(),
  oneDark,
  search({ top: true }),             // Renders search panel at top of editor
  keymap.of(searchKeymap),           // Binds Ctrl+F, Ctrl+H, Enter, Escape
];
```

That single addition gives you: search highlighting, match count, next/previous navigation, case-sensitive toggle, and replace — all from CodeMirror's built-in panel.

#### 5C.2 — Style the search panel
CodeMirror renders the panel inside the editor DOM. Override its styles to match your app theme:

```css
/* In EditorPane.module.css */
.cm-search {
  background: var(--bg-elevated) !important;
  border-bottom: 1px solid var(--border) !important;
  padding: 6px 12px !important;
}

.cm-search input {
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border) !important;
  border-radius: 4px !important;
  padding: 2px 8px !important;
}

.cm-search button {
  background: var(--bg-elevated) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border) !important;
}
```

#### 5C.3 — Keyboard shortcut documentation
Add `Ctrl+F` (Find) and `Ctrl+H` (Find & Replace) to the README keyboard shortcuts table and the command palette (5H) if built.

#### 5C.4 — Toolbar button (optional)
Add a magnifying glass icon to the toolbar that programmatically opens the search panel:

```js
import { openSearchPanel } from '@codemirror/search';

function handleSearchClick() {
  if (editorViewRef.current) {
    openSearchPanel(editorViewRef.current);
  }
}
```

### Definition of Done
- [ ] `Ctrl+F` opens search panel inside editor
- [ ] All matches highlighted in real time as user types
- [ ] Match count shown (e.g. "3 of 12")
- [ ] Enter / Shift+Enter navigates between matches
- [ ] `Ctrl+H` shows replace field
- [ ] "Replace" and "Replace All" buttons work
- [ ] Esc closes the panel
- [ ] Panel styled to match app theme

---

## 5D. AI Writing Assistant

**Category:** AI  |  **Effort:** ~4 days  |  **Difficulty:** Medium

### What it is
Select any text in the editor → a floating action menu appears with AI options: **Improve writing**, **Fix grammar**, **Summarise**, **Expand**, **Make shorter**, **Translate**, **Explain code**. The selected text is replaced with the AI's response. Powered by the Groq API (free tier, very fast inference).

### Why it matters
This is the single most impressive feature on the portfolio. Everyone who sees the demo will try it. It also teaches you: API integration, streaming responses, UI positioning, and selection state management — all skills interviewers ask about.

### New library
```bash
npm install groq-sdk
```

### API setup (free)
1. Sign up at [console.groq.com](https://console.groq.com) — free, no credit card
2. Create an API key
3. Add to `.env.local`: `VITE_GROQ_API_KEY=your_key_here`
4. Add to Vercel: Settings → Environment Variables

> **Security note:** `VITE_` prefix exposes the key in the browser bundle. For a portfolio project this is acceptable. For production, route through a serverless function (Vercel Edge Function — also free).

### State changes
```js
// Add to initialState
aiState: {
  loading: false,
  error: null,
  activeAction: null,   // 'improve' | 'grammar' | 'summarise' | etc.
  menuPosition: null,   // { x, y } for floating menu
  selectedText: '',
}

// Add to reducer
case 'SET_AI_STATE':
  return { ...state, aiState: { ...state.aiState, ...action.payload } };
```

### Tasks

#### 5D.1 — Groq API service
```js
// lib/groqService.js
import Groq from 'groq-sdk';

const client = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true  // Required for client-side usage
});

const PROMPTS = {
  improve:   (text) => `Improve the writing quality of this text. Return only the improved text, no explanation:\n\n${text}`,
  grammar:   (text) => `Fix all grammar and spelling errors in this text. Return only the corrected text:\n\n${text}`,
  summarise: (text) => `Summarise this text concisely in 1-2 sentences. Return only the summary:\n\n${text}`,
  expand:    (text) => `Expand this text with more detail and context. Return only the expanded text:\n\n${text}`,
  shorten:   (text) => `Make this text shorter while keeping the key information. Return only the shortened text:\n\n${text}`,
  translate: (text) => `Translate this text to Hindi. Return only the translation:\n\n${text}`,
  explain:   (text) => `Explain what this code does in simple terms. Return only the explanation:\n\n${text}`,
};

export async function runAIAction(action, selectedText) {
  const prompt = PROMPTS[action]?.(selectedText);
  if (!prompt) throw new Error(`Unknown action: ${action}`);

  const response = await client.chat.completions.create({
    model: 'llama3-8b-8192',    // Fast, free model on Groq
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
    stream: false,
  });

  return response.choices[0].message.content.trim();
}
```

#### 5D.2 — useAIAssistant hook
```js
// hooks/useAIAssistant.js
import { useState } from 'react';
import { runAIAction } from '../lib/groqService';

export function useAIAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function applyAction(action, selectedText, onResult) {
    if (!selectedText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await runAIAction(action, selectedText);
      onResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { applyAction, loading, error };
}
```

#### 5D.3 — AIActionMenu component
Floating menu that appears near the selected text. Position it using the CodeMirror selection's DOM coordinates:

```js
// components/AIActionMenu/AIActionMenu.jsx
const AI_ACTIONS = [
  { id: 'improve',   label: 'Improve writing', icon: '✨' },
  { id: 'grammar',   label: 'Fix grammar',     icon: '✓'  },
  { id: 'summarise', label: 'Summarise',        icon: '⊟'  },
  { id: 'expand',    label: 'Expand',           icon: '⊞'  },
  { id: 'shorten',   label: 'Make shorter',     icon: '⊟'  },
  { id: 'translate', label: 'Translate',        icon: '⊜'  },
  { id: 'explain',   label: 'Explain code',     icon: '{}' },
];
```

The menu renders as an absolutely-positioned `div` at `{ x, y }` with a list of action buttons. On click: call `applyAction`, show a spinner, then replace the selection in CodeMirror with the result.

#### 5D.4 — Selection detection
Listen for `mouseup` events on the editor container. If `window.getSelection().toString().trim()` is non-empty, compute the selection bounding rect and show the menu:

```js
function handleMouseUp() {
  const selection = window.getSelection().toString().trim();
  if (selection.length > 0) {
    const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    dispatch({
      type: 'SET_AI_STATE',
      payload: {
        selectedText: selection,
        menuPosition: { x: rect.left, y: rect.top - 48 }
      }
    });
  } else {
    dispatch({ type: 'SET_AI_STATE', payload: { menuPosition: null } });
  }
}
```

#### 5D.5 — Replace selection in CodeMirror
```js
import { EditorSelection } from '@codemirror/state';

function replaceSelection(view, newText) {
  const { from, to } = view.state.selection.main;
  view.dispatch({
    changes: { from, to, insert: newText },
    selection: EditorSelection.cursor(from + newText.length)
  });
}
```

#### 5D.6 — Loading state & error toast
- Show a pulsing spinner inside the action menu button while loading
- On error: show a small toast notification ("AI unavailable — check your API key")
- Dismiss toast after 4 seconds

### Definition of Done
- [ ] Selecting text in editor shows the AI action menu
- [ ] Menu positioned near the selection (not off-screen)
- [ ] All 7 actions call Groq API and return a result
- [ ] Selected text replaced with AI result in editor
- [ ] Loading spinner shown during API call
- [ ] Error toast shown on API failure
- [ ] Menu closes on Esc or clicking away
- [ ] Works with multi-line selections

---

## 5E. AI Document Title Generator

**Category:** AI  |  **Effort:** ~1 day  |  **Difficulty:** Easy

### What it is
When a user saves a new document that is still titled "Untitled", the app uses Groq to suggest a title based on the document's first 300 characters. A small suggestion bar appears below the document title input: `"Suggested: Getting Started with React Hooks — Use this"`.

### Why it matters
A tiny UX detail that feels magical. It demonstrates thoughtful product design alongside AI integration.

### Prerequisite
Requires 5D (Groq setup) to be done first.

### Tasks

#### 5E.1 — Title generation function
```js
// Add to lib/groqService.js
export async function generateTitle(content) {
  const snippet = content.slice(0, 300).trim();
  if (!snippet) return null;

  const response = await client.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{
      role: 'user',
      content: `Generate a short, descriptive document title (max 8 words) for this content. Return only the title, no punctuation at the end:\n\n${snippet}`
    }],
    max_tokens: 30,
  });
  return response.choices[0].message.content.trim();
}
```

#### 5E.2 — Trigger condition
In the document save flow, check:

```js
async function handleSave() {
  triggerSave();

  // Only suggest title if document is untitled and has content
  if (doc.title === 'Untitled' && doc.content.trim().length > 50) {
    const suggested = await generateTitle(doc.content);
    if (suggested) {
      dispatch({ type: 'SET_SUGGESTED_TITLE', payload: suggested });
    }
  }
}
```

#### 5E.3 — SuggestedTitle component
Renders below the document title input in the sidebar:

```jsx
{suggestedTitle && (
  <div className={styles.suggestion}>
    <span>Suggested: <em>{suggestedTitle}</em></span>
    <button onClick={() => applyTitle(suggestedTitle)}>Use this</button>
    <button onClick={() => dismissSuggestion()}>✕</button>
  </div>
)}
```

#### 5E.4 — State additions
```js
// Add to initialState
suggestedTitle: null,

// Add to reducer
case 'SET_SUGGESTED_TITLE':
  return { ...state, suggestedTitle: action.payload };
case 'CLEAR_SUGGESTED_TITLE':
  return { ...state, suggestedTitle: null };
```

### Definition of Done
- [ ] Suggestion only appears when document is "Untitled" and has content > 50 chars
- [ ] "Use this" applies the title and clears the suggestion
- [ ] "✕" dismisses without applying
- [ ] Suggestion clears automatically once user manually edits the title
- [ ] No suggestion if Groq API is unavailable (graceful degradation)

---

## 5F. Share by Link (Read-Only)

**Category:** Sharing  |  **Effort:** ~1 day  |  **Difficulty:** Easy

### What it is
A "Share" button generates a URL that encodes the document content as a Base64 URL parameter. Anyone opening the URL sees the rendered Markdown preview — no login, no backend, no database. Documents under ~8KB work perfectly. Larger documents get a warning.

### Why it matters
Feels like a real product feature. Technically elegant (zero infra cost). The shareable link URL you paste into your portfolio README itself demonstrates the feature.

### No new libraries needed
Uses native `btoa()`, `atob()`, `URLSearchParams`, and `navigator.clipboard`.

### Tasks

#### 5F.1 — Encode and decode functions
```js
// lib/shareLink.js
export function encodeDocument(content, title) {
  const payload = JSON.stringify({ content, title, v: 1 });
  return btoa(encodeURIComponent(payload));  // URI-encode first to handle Unicode
}

export function decodeDocument(encoded) {
  try {
    const payload = JSON.parse(decodeURIComponent(atob(encoded)));
    return payload;
  } catch {
    return null;
  }
}

export function buildShareURL(content, title) {
  const encoded = encodeDocument(content, title);
  const url = new URL(window.location.href);
  url.searchParams.set('share', encoded);
  url.hash = '';
  return url.toString();
}

export function getSharedDocFromURL() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('share');
  return encoded ? decodeDocument(encoded) : null;
}
```

#### 5F.2 — Load shared document on app start
```js
// In App.jsx — add to useEffect on mount
useEffect(() => {
  const shared = getSharedDocFromURL();
  if (shared) {
    dispatch({ type: 'SET_MARKDOWN', payload: shared.content });
    dispatch({ type: 'SET_VIEW_MODE', payload: 'preview' }); // Show preview by default
    // Show a banner: "You're viewing a shared document — Edit to create your own copy"
  }
}, []);
```

#### 5F.3 — ShareModal component
Triggered by clicking the "Share" button in the toolbar:

```jsx
// components/ShareModal/ShareModal.jsx
function ShareModal({ content, title, onClose }) {
  const url = buildShareURL(content, title);
  const sizeKB = Math.round(new Blob([url]).size / 1024);
  const tooLarge = sizeKB > 8;

  return (
    <div className={styles.modal}>
      <h3>Share document</h3>
      {tooLarge ? (
        <p className={styles.warning}>
          Document is {sizeKB}KB — too large for a URL. Max recommended: 8KB.
          Export to file instead.
        </p>
      ) : (
        <>
          <input readOnly value={url} className={styles.urlInput} />
          <button onClick={() => navigator.clipboard.writeText(url)}>
            Copy link
          </button>
          <p className={styles.hint}>Anyone with this link can view (not edit) this document.</p>
        </>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

#### 5F.4 — "Viewing shared document" banner
When a shared document is loaded from the URL, show a non-intrusive top banner:

```jsx
<div className={styles.sharedBanner}>
  You're viewing a shared document.
  <button onClick={createPersonalCopy}>Edit your own copy</button>
  <button onClick={dismissBanner}>✕</button>
</div>
```

"Edit your own copy" saves the document to the user's IndexedDB and removes the `?share=` parameter from the URL.

### Definition of Done
- [ ] "Share" button in toolbar generates a URL
- [ ] URL opens in a new tab and shows rendered preview
- [ ] "Copy link" copies to clipboard with success feedback
- [ ] Documents > 8KB show a size warning instead
- [ ] Shared view shows a "viewing shared document" banner
- [ ] "Edit your own copy" saves to local storage and enters edit mode
- [ ] Invalid/corrupt share URLs degrade gracefully (no crash)

---

## 5G. Publish as GitHub Gist

**Category:** Sharing  |  **Effort:** ~3 days  |  **Difficulty:** Medium

### What it is
A "Publish to Gist" button in the export menu. The user enters their GitHub Personal Access Token once (stored in localStorage). The app calls the GitHub Gist API to create a public Gist with the document content and returns the Gist URL. Subsequent clicks on the same document update the existing Gist.

### Why it matters
Practical for developers — they actually use Gists. It demonstrates GitHub API integration and token management in a portfolio context.

### No new libraries needed
Uses the GitHub REST API via `fetch`.

### Tasks

#### 5G.1 — GitHub Gist API service
```js
// lib/gistService.js
const GITHUB_API = 'https://api.github.com';

export async function createGist(token, filename, content, description = '') {
  const response = await fetch(`${GITHUB_API}/gists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify({
      description: description || filename,
      public: true,
      files: {
        [filename.endsWith('.md') ? filename : `${filename}.md`]: {
          content
        }
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create Gist');
  }

  return response.json(); // Returns full Gist object including html_url
}

export async function updateGist(token, gistId, filename, content) {
  const response = await fetch(`${GITHUB_API}/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify({
      files: {
        [filename]: { content }
      }
    })
  });

  if (!response.ok) throw new Error('Failed to update Gist');
  return response.json();
}
```

#### 5G.2 — Token management
```js
// lib/tokenStorage.js
const TOKEN_KEY = 'livemd:github_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};
```

#### 5G.3 — GistModal component
```
State machine for the modal:
  idle → (no token) → token-prompt
  idle → (has token) → confirm-publish
  confirm-publish → (click publish) → loading
  loading → (success) → success (show Gist URL)
  loading → (error) → error (show message, retry button)
```

Walk the user through:
1. If no token: prompt for GitHub PAT with link to `github.com/settings/tokens`
2. Confirm: "Publish `{title}` as a public Gist?"
3. Loading spinner
4. Success: show Gist URL with "Open Gist" and "Copy URL" buttons

#### 5G.4 — Store Gist ID per document
Add `gistId` to the document schema so subsequent publishes update rather than create:

```js
// Add to document shape in lib/db.js
{
  id: nanoid(),
  title: string,
  content: string,
  createdAt: Date,
  updatedAt: Date,
  gistId: string | null,     // ← new field
  gistUrl: string | null,    // ← new field
}
```

#### 5G.5 — "Published" indicator in sidebar
When a document has a `gistId`, show a small GitHub icon badge next to its title in the sidebar. Clicking it opens the Gist URL.

### Definition of Done
- [ ] First-time publish prompts for GitHub token
- [ ] Token saved in localStorage (not re-asked)
- [ ] Successful publish shows Gist URL
- [ ] Second publish on same document updates the Gist
- [ ] Published indicator shown in sidebar
- [ ] Invalid token shows a clear error message
- [ ] "Disconnect GitHub" option to clear token in settings

---

## 5H. Command Palette (Ctrl+K)

**Category:** Power user  |  **Effort:** ~5 days  |  **Difficulty:** Hard

### What it is
A modal that opens with `Ctrl+K`. It provides fuzzy-search over all app actions and documents. Navigate with arrow keys, activate with Enter, dismiss with Esc. Modeled after Linear, VS Code, and Vercel's command palettes.

### Why it matters
Power users love command palettes. It signals the app is keyboard-first and professionally designed. It also neatly ties together every feature you've built — every action is accessible from one place.

### New library
```bash
npm install cmdk
```

`cmdk` is the library used by Vercel, Raycast, and many other developer tools. It handles keyboard navigation, filtering, and accessibility out of the box.

### Tasks

#### 5H.1 — Command registry
Define all commands as a flat array. This is the single source of truth:

```js
// lib/commands.js
export const buildCommands = ({ dispatch, documents, createSnapshot,
  exportMarkdown, exportHTML, exportPDF, activeDoc }) => [

  // Document actions
  { id: 'new-doc',      group: 'Document', label: 'New document',        shortcut: 'Ctrl+N',   action: () => dispatch({ type: 'NEW_DOCUMENT' }) },
  { id: 'save',         group: 'Document', label: 'Save',                shortcut: 'Ctrl+S',   action: () => createSnapshot('Manual save') },
  { id: 'export-md',    group: 'Export',   label: 'Export as Markdown',  shortcut: '',         action: () => exportMarkdown() },
  { id: 'export-html',  group: 'Export',   label: 'Export as HTML',      shortcut: '',         action: () => exportHTML() },
  { id: 'export-pdf',   group: 'Export',   label: 'Export as PDF',       shortcut: '',         action: () => exportPDF() },

  // View actions
  { id: 'focus-mode',   group: 'View',     label: 'Toggle focus mode',   shortcut: 'Ctrl+↵',  action: () => dispatch({ type: 'TOGGLE_FOCUS_MODE' }) },
  { id: 'split-view',   group: 'View',     label: 'Split view',          shortcut: '',         action: () => dispatch({ type: 'SET_VIEW_MODE', payload: 'split' }) },
  { id: 'editor-only',  group: 'View',     label: 'Editor only',         shortcut: '',         action: () => dispatch({ type: 'SET_VIEW_MODE', payload: 'editor' }) },
  { id: 'preview-only', group: 'View',     label: 'Preview only',        shortcut: '',         action: () => dispatch({ type: 'SET_VIEW_MODE', payload: 'preview' }) },
  { id: 'toggle-theme', group: 'View',     label: 'Toggle theme',        shortcut: '',         action: () => dispatch({ type: 'TOGGLE_THEME' }) },

  // Document switcher — dynamically generated
  ...documents.map(doc => ({
    id: `open-doc-${doc.id}`,
    group: 'Open document',
    label: doc.title || 'Untitled',
    shortcut: '',
    action: () => dispatch({ type: 'SET_ACTIVE_DOC', payload: doc })
  })),
];
```

#### 5H.2 — CommandPalette component
```jsx
// components/CommandPalette/CommandPalette.jsx
import { Command } from 'cmdk';

function CommandPalette({ open, onClose, commands }) {
  return (
    <Command.Dialog open={open} onOpenChange={onClose} label="Command palette">
      <Command.Input placeholder="Type a command or search..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        {GROUP_NAMES.map(group => {
          const items = commands.filter(c => c.group === group);
          if (!items.length) return null;
          return (
            <Command.Group heading={group} key={group}>
              {items.map(cmd => (
                <Command.Item
                  key={cmd.id}
                  onSelect={() => { cmd.action(); onClose(); }}
                >
                  <span>{cmd.label}</span>
                  {cmd.shortcut && <kbd>{cmd.shortcut}</kbd>}
                </Command.Item>
              ))}
            </Command.Group>
          );
        })}
      </Command.List>
    </Command.Dialog>
  );
}
```

#### 5H.3 — Keyboard trigger
```js
// Add to useKeyboardShortcuts.js
if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
  e.preventDefault();
  dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
}
```

#### 5H.4 — State additions
```js
// Add to initialState
commandPaletteOpen: false,

// Add to reducer
case 'TOGGLE_COMMAND_PALETTE':
  return { ...state, commandPaletteOpen: !state.commandPaletteOpen };
```

#### 5H.5 — Styling the palette
```css
/* components/CommandPalette/CommandPalette.module.css */
[cmdk-dialog] {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: min(560px, 90vw);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  overflow: hidden;
  z-index: 9999;
}

[cmdk-input] {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
  outline: none;
}

[cmdk-item] {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 6px;
}

[cmdk-item][aria-selected="true"] {
  background: var(--bg-elevated);
}

[cmdk-group-heading] {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  padding: 8px 16px 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

#### 5H.6 — Backdrop overlay
Render a semi-transparent backdrop behind the palette. Clicking it closes the palette.

### Definition of Done
- [ ] `Ctrl+K` opens the palette
- [ ] All commands from the registry are listed and grouped
- [ ] Fuzzy search filters commands as user types
- [ ] Arrow keys navigate, Enter activates
- [ ] Esc closes the palette
- [ ] Document titles appear in "Open document" group
- [ ] Keyboard shortcut hints shown on the right
- [ ] Backdrop closes palette on click
- [ ] Accessible: `aria-label`, focus trap, screen reader announcements

---

## 5I. Document Templates

**Category:** Power user  |  **Effort:** ~1 day  |  **Difficulty:** Easy

### What it is
When creating a new document, a modal (or inline panel) offers a grid of starter templates: Blog post, README, Meeting notes, Technical spec, Daily journal, API documentation. Selecting a template pre-fills the editor with a well-structured Markdown skeleton.

### Why it matters
Eliminates blank-page anxiety for users. Shows product thinking — you anticipated a real friction point and solved it. Takes roughly one afternoon to build.

### No new libraries needed
Just a JSON file and a modal component.

### Tasks

#### 5I.1 — Templates data file
```js
// lib/templates.js
export const TEMPLATES = [
  {
    id: 'blog-post',
    label: 'Blog post',
    description: 'Article with intro, sections, and conclusion',
    icon: '✍️',
    content: `# Blog Post Title

## Introduction

Write your introduction here. Hook the reader in the first sentence.

## Section 1

Your content here.

## Section 2

Your content here.

## Conclusion

Wrap up your key points.

---

*Published on ${new Date().toLocaleDateString()}*`
  },
  {
    id: 'readme',
    label: 'README',
    description: 'GitHub repository README',
    icon: '📦',
    content: `# Project Name

> One-line description of your project.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`js
// Example usage here
\`\`\`

## Contributing

Pull requests are welcome.

## License

MIT`
  },
  {
    id: 'meeting-notes',
    label: 'Meeting notes',
    description: 'Structured notes with action items',
    icon: '📋',
    content: `# Meeting Notes — ${new Date().toLocaleDateString()}

**Attendees:** 

**Agenda:**

---

## Discussion

### Topic 1


### Topic 2


## Decisions Made

- 

## Action Items

| Task | Owner | Due Date |
|------|-------|----------|
|      |       |          |

## Next Meeting

Date: `
  },
  {
    id: 'tech-spec',
    label: 'Technical spec',
    description: 'Engineering design document',
    icon: '⚙️',
    content: `# Technical Specification: Feature Name

**Author:**  
**Status:** Draft  
**Last updated:** ${new Date().toLocaleDateString()}

## Overview

Brief description of what this feature does and why.

## Goals

- 
- 

## Non-Goals

- 

## Technical Design

### Architecture


### Data Model

\`\`\`
// Schema here
\`\`\`

### API Changes


## Open Questions

- [ ] 

## References

- `
  },
  {
    id: 'daily-journal',
    label: 'Daily journal',
    description: 'Reflection and planning',
    icon: '📔',
    content: `# ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## How I'm feeling

## What I worked on today

## What went well

## What I want to improve

## Tomorrow's priorities

1. 
2. 
3. `
  },
  {
    id: 'api-docs',
    label: 'API documentation',
    description: 'REST API endpoint documentation',
    icon: '🔌',
    content: `# API Documentation

## Base URL

\`https://api.example.com/v1\`

## Authentication

\`\`\`
Authorization: Bearer <token>
\`\`\`

---

## Endpoints

### GET /resource

Returns a list of resources.

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| limit | integer | No | Max results (default: 20) |

**Response**

\`\`\`json
{
  "data": [],
  "total": 0
}
\`\`\`

---`
  },
];
```

#### 5I.2 — TemplateModal component
```jsx
// components/TemplateModal/TemplateModal.jsx
function TemplateModal({ onSelect, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Choose a template</h2>
          <button onClick={onClose}>Start blank</button>
        </div>
        <div className={styles.grid}>
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              className={styles.card}
              onClick={() => { onSelect(tpl); onClose(); }}
            >
              <span className={styles.icon}>{tpl.icon}</span>
              <span className={styles.label}>{tpl.label}</span>
              <span className={styles.desc}>{tpl.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### 5I.3 — Trigger on new document
Show the TemplateModal when the user clicks "New Document" in the sidebar — before creating the document. If they click "Start blank", proceed with an empty document.

#### 5I.4 — Template auto-title
When a template is selected, use the template label as the initial document title (e.g. "Blog post", "Meeting notes — 08/06/2026").

### Definition of Done
- [ ] "New Document" shows template chooser modal
- [ ] All 6 templates present with icon, name, description
- [ ] Selecting a template pre-fills editor with skeleton content
- [ ] Template label used as initial document title
- [ ] "Start blank" skips template selection
- [ ] Templates use today's date dynamically where applicable

---

## 5J. Drag & Drop Image Upload

**Category:** UX  |  **Effort:** ~2 days  |  **Difficulty:** Medium

### What it is
Drag any image file from the desktop and drop it onto the editor pane. The image is read as a Base64 data URI using the FileReader API and inserted at the cursor position as a Markdown image tag: `![filename](data:image/png;base64,...)`. Works entirely in the browser — no upload server.

### Why it matters
The biggest friction in Markdown writing is embedding images. This removes that friction completely. It also demonstrates `FileReader` and `DataTransfer` API knowledge — browser APIs most developers haven't touched.

### No new libraries needed
Uses native `FileReader API`, `DataTransfer API`, and CodeMirror's dispatch API.

### Tasks

#### 5J.1 — Drop zone event handlers on editor pane
```js
// In EditorPane.jsx
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  setIsDragOver(true);  // Show visual highlight
}

function handleDragLeave() {
  setIsDragOver(false);
}

async function handleDrop(e) {
  e.preventDefault();
  setIsDragOver(false);

  const files = Array.from(e.dataTransfer.files).filter(f =>
    f.type.startsWith('image/')
  );

  for (const file of files) {
    const markdown = await fileToMarkdown(file);
    insertAtCursor(editorViewRef.current, markdown);
  }
}
```

#### 5J.2 — File-to-Markdown converter
```js
// lib/imageUpload.js
export function fileToMarkdown(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result; // Full data URI
      const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_');

      // Warn if image is large
      const sizeKB = Math.round(file.size / 1024);
      if (sizeKB > 500) {
        console.warn(`Image ${safeName} is ${sizeKB}KB — large images inflate document size`);
      }

      resolve(`![${safeName}](${base64})`);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

#### 5J.3 — Insert at cursor position
```js
// lib/editorHelpers.js
export function insertAtCursor(view, text) {
  if (!view) return;
  const { from } = view.state.selection.main;
  view.dispatch({
    changes: { from, to: from, insert: `\n${text}\n` },
    selection: { anchor: from + text.length + 2 }
  });
  view.focus();
}
```

#### 5J.4 — Visual drag-over highlight
```css
/* EditorPane.module.css */
.editorWrap[data-drag-over="true"] {
  outline: 2px dashed var(--accent-blue);
  outline-offset: -4px;
  background: rgba(88, 166, 255, 0.04);
}
```

```jsx
<div
  className={styles.editorWrap}
  data-drag-over={isDragOver}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
  <CodeMirror ... />
</div>
```

#### 5J.5 — Image size warning toast
If the dropped image is over 500KB, show a toast: `"Large image (1.2MB) — consider compressing it before embedding."` Dismiss after 5 seconds.

#### 5J.6 — Paste image support (bonus)
Also handle `Ctrl+V` with image data in clipboard:

```js
function handlePaste(e) {
  const items = Array.from(e.clipboardData.items);
  const imageItems = items.filter(item => item.type.startsWith('image/'));
  if (imageItems.length === 0) return; // Let normal paste proceed

  e.preventDefault();
  imageItems.forEach(async item => {
    const file = item.getAsFile();
    const markdown = await fileToMarkdown(file);
    insertAtCursor(editorViewRef.current, markdown);
  });
}
```

### Definition of Done
- [ ] Dragging an image over the editor shows a dashed highlight
- [ ] Dropping inserts `![filename](base64)` at cursor position
- [ ] Multiple images dropped at once are all inserted
- [ ] Non-image files dropped are silently ignored
- [ ] Images > 500KB show a size warning toast
- [ ] `Ctrl+V` with clipboard image also inserts it (bonus)
- [ ] Inserted image renders correctly in the preview pane

---

## 5K. Reading Mode with Typography Settings

**Category:** UX  |  **Effort:** ~1 day  |  **Difficulty:** Easy

### What it is
An enhanced "Preview only" mode with a floating typography control panel. Users can adjust: font size (14–22px), line width (480–900px), and font family (Serif / Sans / Mono). Settings persist in localStorage. Feels like a proper reading app (iA Writer, Medium).

### Why it matters
Shows design sensibility — you thought about the reading experience, not just writing. It's also a visually distinctive feature that stands out in a portfolio demo.

### No new libraries needed
Pure CSS variables + React state.

### Tasks

#### 5K.1 — Typography settings state
```js
// Add to initialState
readingSettings: {
  fontSize: 17,             // px
  lineWidth: 680,           // px (max-width of content column)
  fontFamily: 'serif',      // 'serif' | 'sans' | 'mono'
  lineHeight: 1.8,
},

// Add to reducer
case 'SET_READING_SETTING':
  return {
    ...state,
    readingSettings: { ...state.readingSettings, ...action.payload }
  };
```

#### 5K.2 — Persist settings to localStorage
```js
// In App.jsx or a dedicated hook
useEffect(() => {
  localStorage.setItem('livemd:readingSettings', JSON.stringify(state.readingSettings));
}, [state.readingSettings]);

// On mount — load from storage
const savedSettings = JSON.parse(localStorage.getItem('livemd:readingSettings') || 'null');
if (savedSettings) dispatch({ type: 'SET_READING_SETTING', payload: savedSettings });
```

#### 5K.3 — Apply settings to preview pane
```jsx
// In PreviewPane.jsx
const fontMap = {
  serif: "'Lora', Georgia, serif",
  sans:  "'Inter', system-ui, sans-serif",
  mono:  "'JetBrains Mono', monospace",
};

<div
  className={styles.preview}
  style={{
    fontSize: `${settings.fontSize}px`,
    maxWidth: `${settings.lineWidth}px`,
    fontFamily: fontMap[settings.fontFamily],
    lineHeight: settings.lineHeight,
    margin: '0 auto',
  }}
>
  <ReactMarkdown ...>{debouncedMarkdown}</ReactMarkdown>
</div>
```

#### 5K.4 — TypographyPanel component
A floating panel that appears only in Preview / Reading mode, anchored to the bottom-right corner:

```jsx
// components/TypographyPanel/TypographyPanel.jsx
function TypographyPanel({ settings, onChange }) {
  return (
    <div className={styles.panel}>
      {/* Font size slider */}
      <label>Size: {settings.fontSize}px</label>
      <input
        type="range" min="14" max="22" step="1"
        value={settings.fontSize}
        onChange={e => onChange({ fontSize: Number(e.target.value) })}
      />

      {/* Line width slider */}
      <label>Width: {settings.lineWidth}px</label>
      <input
        type="range" min="480" max="900" step="20"
        value={settings.lineWidth}
        onChange={e => onChange({ lineWidth: Number(e.target.value) })}
      />

      {/* Font family toggle */}
      <div className={styles.fontToggle}>
        {['serif', 'sans', 'mono'].map(f => (
          <button
            key={f}
            className={settings.fontFamily === f ? styles.active : ''}
            onClick={() => onChange({ fontFamily: f })}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
```

#### 5K.5 — Show panel only in reading/preview mode
The `TypographyPanel` renders only when `viewMode === 'preview'`. When switching away from preview mode, the panel auto-hides.

### Definition of Done
- [ ] Typography panel visible only in preview mode
- [ ] Font size slider (14–22px) updates preview in real time
- [ ] Line width slider (480–900px) updates max-width in real time
- [ ] Font family toggle switches between Serif, Sans, Mono
- [ ] All settings persist across page refreshes (localStorage)
- [ ] Panel does not interfere with preview content
- [ ] Readable in both light and dark theme

---

## 5L. Tags & Full-Text Document Search

**Category:** Productivity  |  **Effort:** ~3 days  |  **Difficulty:** Medium

### What it is
Each document can have tags (e.g. `#blog`, `#work`, `#react`). The sidebar has a tag filter section — clicking a tag shows only documents with that tag. A search bar at the top of the sidebar does full-text search across all document content stored in IndexedDB. Together these turn the editor into a personal knowledge base.

### Why it matters
Users with more than 10 documents immediately need this. It's the feature that makes them keep using the app long-term. From a technical standpoint it demonstrates IndexedDB indexing and search implementation — skills interviewers respect.

### No new libraries needed
Uses IndexedDB indexes (already in project) + a simple client-side text search.

### State changes
```js
// Add to initialState
searchQuery: '',
activeTagFilter: null,   // null = show all
```

### New document schema fields
```js
{
  id: nanoid(),
  title: string,
  content: string,
  tags: string[],          // ← new: array of tag strings e.g. ['blog', 'react']
  createdAt: Date,
  updatedAt: Date,
  gistId: string | null,
  gistUrl: string | null,
}
```

### Tasks

#### 5L.1 — Tag input component
```jsx
// components/TagInput/TagInput.jsx
// Renders a tag-pill input inside the document metadata bar
// User types a tag and presses Enter or comma to add it
// Shows existing tags as removable pills

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');

  function addTag(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = input.trim().toLowerCase().replace(/^#/, '');
      if (tag && !tags.includes(tag)) {
        onChange([...tags, tag]);
      }
      setInput('');
    }
  }

  function removeTag(tag) {
    onChange(tags.filter(t => t !== tag));
  }

  return (
    <div className={styles.tagInput}>
      {tags.map(tag => (
        <span key={tag} className={styles.pill}>
          #{tag}
          <button onClick={() => removeTag(tag)}>✕</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={addTag}
        placeholder={tags.length === 0 ? 'Add tags...' : ''}
      />
    </div>
  );
}
```

#### 5L.2 — Update IndexedDB schema for tags
```js
// lib/db.js — bump version to 3
upgrade(db, oldVersion) {
  // ... previous upgrades ...
  if (oldVersion < 3) {
    const store = db.transaction.objectStore('documents');
    store.createIndex('tags', 'tags', { multiEntry: true }); // multiEntry allows querying individual tags
  }
}
```

#### 5L.3 — Tag filter in sidebar
```js
// lib/db.js — add filtered query
export async function getDocumentsByTag(tag) {
  const index = (await db).transaction('documents').store.index('tags');
  return index.getAll(tag);
}
```

Render a "Tags" section in the sidebar below the document list. Show all unique tags across all documents. Clicking a tag activates the filter.

#### 5L.4 — Full-text search
IndexedDB doesn't have native full-text search, so implement client-side:

```js
// lib/search.js
export function searchDocuments(documents, query) {
  if (!query.trim()) return documents;
  const terms = query.toLowerCase().split(/\s+/);

  return documents
    .filter(doc => {
      const searchable = `${doc.title} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase();
      return terms.every(term => searchable.includes(term));
    })
    .sort((a, b) => {
      // Rank: title match > tag match > content match
      const titleA = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const titleB = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      return titleB - titleA;
    });
}
```

This loads all documents into memory and filters client-side — perfectly fast for hundreds of documents of text.

#### 5L.5 — Search bar in sidebar
```jsx
// In Sidebar.jsx — add above document list
<input
  type="search"
  placeholder="Search documents..."
  value={searchQuery}
  onChange={e => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
  className={styles.searchInput}
/>
```

Filter the document list in real time as the user types. Debounce at 150ms to avoid IndexedDB spam.

#### 5L.6 — Search result highlighting
When search results are shown, highlight the matching term in the document title using a simple regex wrap:

```js
function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
// Use dangerouslySetInnerHTML only on sanitized title text (no markdown)
```

#### 5L.7 — Tag display in document list
Each document row in the sidebar shows its first 2–3 tags as small pills below the title.

### Definition of Done
- [ ] Tag input adds tags on Enter or comma
- [ ] Tags displayed as removable pills on each document
- [ ] Sidebar "Tags" section shows all unique tags
- [ ] Clicking a tag filters document list to that tag only
- [ ] "All documents" link clears tag filter
- [ ] Search bar filters documents by title, content, and tags
- [ ] Search results ranked by match quality (title > content)
- [ ] Matching query term highlighted in result titles
- [ ] Tags persist in IndexedDB with document

---

## 10. Updated Folder Structure

```
livemd/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── EditorPane.jsx
│   │   │   ├── EditorPane.module.css
│   │   │   └── index.js
│   │   ├── Preview/
│   │   │   ├── PreviewPane.jsx
│   │   │   ├── PreviewPane.module.css
│   │   │   └── index.js
│   │   ├── Toolbar/
│   │   │   ├── Toolbar.jsx
│   │   │   ├── Toolbar.module.css
│   │   │   └── ToolbarButton.jsx
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── DocumentList.jsx
│   │   │   └── Sidebar.module.css
│   │   ├── StatusBar/
│   │   │   ├── StatusBar.jsx
│   │   │   └── StatusBar.module.css
│   │   ├── ExportModal/
│   │   │   ├── ExportModal.jsx
│   │   │   └── ExportModal.module.css
│   │   ├── AIActionMenu/             ← NEW (5D)
│   │   │   ├── AIActionMenu.jsx
│   │   │   └── AIActionMenu.module.css
│   │   ├── CommandPalette/           ← NEW (5H)
│   │   │   ├── CommandPalette.jsx
│   │   │   └── CommandPalette.module.css
│   │   ├── HistoryPanel/             ← NEW (5B)
│   │   │   ├── HistoryPanel.jsx
│   │   │   ├── DiffView.jsx
│   │   │   └── HistoryPanel.module.css
│   │   ├── ShareModal/               ← NEW (5F)
│   │   │   ├── ShareModal.jsx
│   │   │   └── ShareModal.module.css
│   │   ├── GistModal/                ← NEW (5G)
│   │   │   ├── GistModal.jsx
│   │   │   └── GistModal.module.css
│   │   ├── TemplateModal/            ← NEW (5I)
│   │   │   ├── TemplateModal.jsx
│   │   │   └── TemplateModal.module.css
│   │   ├── TypographyPanel/          ← NEW (5K)
│   │   │   ├── TypographyPanel.jsx
│   │   │   └── TypographyPanel.module.css
│   │   └── TagInput/                 ← NEW (5L)
│   │       ├── TagInput.jsx
│   │       └── TagInput.module.css
│   ├── context/
│   │   ├── MarkdownContext.jsx
│   │   └── markdownReducer.js
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   ├── useAutosave.js
│   │   ├── useKeyboardShortcuts.js
│   │   ├── useWordCount.js
│   │   ├── useDocuments.js
│   │   ├── useAIAssistant.js         ← NEW (5D)
│   │   └── useVersionHistory.js      ← NEW (5B)
│   ├── lib/
│   │   ├── db.js                     ← Updated (5B, 5L: new stores + indexes)
│   │   ├── export.js
│   │   ├── markdownHelpers.js
│   │   ├── groqService.js            ← NEW (5D, 5E)
│   │   ├── gistService.js            ← NEW (5G)
│   │   ├── shareLink.js              ← NEW (5F)
│   │   ├── tokenStorage.js           ← NEW (5G)
│   │   ├── templates.js              ← NEW (5I)
│   │   ├── imageUpload.js            ← NEW (5J)
│   │   ├── search.js                 ← NEW (5L)
│   │   ├── diff.js                   ← NEW (5B)
│   │   ├── focusMode.js              ← NEW (5A)
│   │   ├── commands.js               ← NEW (5H)
│   │   └── editorHelpers.js          ← NEW (5J, general)
│   ├── styles/
│   │   ├── globals.css
│   │   ├── themes.css
│   │   └── typography.css
│   ├── App.jsx
│   └── main.jsx
├── tests/
│   ├── hooks/
│   │   ├── useDebounce.test.js
│   │   ├── useWordCount.test.js
│   │   └── useVersionHistory.test.js ← NEW
│   └── lib/
│       ├── markdownHelpers.test.js
│       ├── shareLink.test.js          ← NEW
│       ├── search.test.js             ← NEW
│       └── diff.test.js               ← NEW
├── .eslintrc.json
├── .prettierrc
├── vite.config.js
└── README.md
```

---

## 11. Updated State Architecture

### Full Context Shape (Phases 1–5)

```js
// context/MarkdownContext.jsx
const initialState = {
  // Core (Phases 1–4)
  markdown: '# Welcome to LiveMD\n\nStart writing...',
  theme: 'dark',
  viewMode: 'split',           // 'editor' | 'split' | 'preview'
  sidebarOpen: true,
  activeDocId: null,
  documents: [],
  lastSaved: null,

  // Phase 5A — Focus mode
  focusMode: false,

  // Phase 5B — Version history
  historyPanelOpen: false,

  // Phase 5D — AI assistant
  aiState: {
    loading: false,
    error: null,
    activeAction: null,
    menuPosition: null,        // { x, y }
    selectedText: '',
  },

  // Phase 5E — AI title suggestion
  suggestedTitle: null,

  // Phase 5H — Command palette
  commandPaletteOpen: false,

  // Phase 5K — Reading / typography settings
  readingSettings: {
    fontSize: 17,
    lineWidth: 680,
    fontFamily: 'serif',       // 'serif' | 'sans' | 'mono'
    lineHeight: 1.8,
  },

  // Phase 5L — Search & tags
  searchQuery: '',
  activeTagFilter: null,
};
```

### Complete Reducer Actions (Phases 1–5)

```js
// context/markdownReducer.js
export function markdownReducer(state, action) {
  switch (action.type) {
    // Core actions
    case 'SET_MARKDOWN':
      return { ...state, markdown: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_ACTIVE_DOC':
      return { ...state, activeDocId: action.payload.id, markdown: action.payload.content };
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
    case 'NEW_DOCUMENT':
      return { ...state, activeDocId: null, markdown: '' };

    // Phase 5A
    case 'TOGGLE_FOCUS_MODE':
      return { ...state, focusMode: !state.focusMode };

    // Phase 5B
    case 'TOGGLE_HISTORY_PANEL':
      return { ...state, historyPanelOpen: !state.historyPanelOpen };

    // Phase 5D
    case 'SET_AI_STATE':
      return { ...state, aiState: { ...state.aiState, ...action.payload } };

    // Phase 5E
    case 'SET_SUGGESTED_TITLE':
      return { ...state, suggestedTitle: action.payload };
    case 'CLEAR_SUGGESTED_TITLE':
      return { ...state, suggestedTitle: null };

    // Phase 5H
    case 'TOGGLE_COMMAND_PALETTE':
      return { ...state, commandPaletteOpen: !state.commandPaletteOpen };

    // Phase 5K
    case 'SET_READING_SETTING':
      return { ...state, readingSettings: { ...state.readingSettings, ...action.payload } };

    // Phase 5L
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_TAG_FILTER':
      return { ...state, activeTagFilter: action.payload };

    default:
      return state;
  }
}
```

### Data Flow Diagrams

**Core editing flow (Phases 1–4):**
```
User types in CodeMirror
        ↓
  dispatch(SET_MARKDOWN)
        ↓
   MarkdownContext updates
        ↓
  useDebounce (300ms delay)
        ↓
   PreviewPane re-renders   +   useAutosave writes to IndexedDB
```

**Focus mode flow (5A):**
```
User presses F11 / Ctrl+Enter
        ↓
  dispatch(TOGGLE_FOCUS_MODE)
        ↓
  data-focus-mode="true" set on <html>
        ↓
  CSS hides toolbar, sidebar, status bar
        ↓
  Fullscreen API engaged
        ↓
  Exit hint shown → fades after 3s
```

**Version history flow (5B):**
```
Every 5 minutes (interval) OR Ctrl+S
        ↓
  useVersionHistory.createSnapshot()
        ↓
  IndexedDB snapshots store ← pruned to 50 max
        ↓
  User opens HistoryPanel
        ↓
  Snapshots listed (sorted newest-first)
        ↓
  User clicks "Restore"
        ↓
  dispatch(SET_MARKDOWN, snapshot.content)
```

**AI writing assistant flow (5D):**
```
User selects text in editor
        ↓
  mouseup → window.getSelection()
        ↓
  AIActionMenu appears at selection coordinates
        ↓
  User clicks action (e.g. "Improve")
        ↓
  useAIAssistant.applyAction() → Groq API call
        ↓
  Loading spinner shown
        ↓
  Result returned → replaceSelection(view, result)
        ↓
  AIActionMenu closes
```

**Share-by-link flow (5F):**
```
User clicks "Share"
        ↓
  buildShareURL(content, title)
        ↓
  btoa(encodeURIComponent(JSON)) → URL param
        ↓
  ShareModal shows URL + "Copy link" button
        ↓
  Recipient opens URL
        ↓
  App mounts → getSharedDocFromURL()
        ↓
  dispatch(SET_MARKDOWN, shared.content)
        ↓
  viewMode set to 'preview'
        ↓
  "Viewing shared document" banner shown
```

**Command palette flow (5H):**
```
User presses Ctrl+K
        ↓
  dispatch(TOGGLE_COMMAND_PALETTE)
        ↓
  CommandPalette modal opens (cmdk)
        ↓
  User types → fuzzy-filters command registry
        ↓
  User presses Enter on a command
        ↓
  command.action() called
        ↓
  dispatch(TOGGLE_COMMAND_PALETTE) → closes
```

---

## 12. Database & Storage Strategy

### Phase 1: localStorage

**Use for:** Single document, theme preference, last view mode, reading settings (5K), GitHub token (5G)
**Limit:** ~5MB, string-only  
**Keys:**
```
livemd:content            → Raw markdown string
livemd:theme              → 'dark' | 'light'
livemd:viewMode           → 'split' | 'editor' | 'preview'
livemd:readingSettings    → JSON (5K)
livemd:github_token       → GitHub PAT string (5G)
```

### Phase 2: IndexedDB (via `idb`)

**Use for:** Multiple documents, snapshots, tags  
**Limit:** Hundreds of MB — effectively unlimited for text  
**Final schema after all Phase 5 features:**

```
Database: livemd (version 3)

ObjectStore: documents
  keyPath: id (nanoid)
  indexes:
    - updatedAt        (sort by recent)
    - title            (search)
    - tags             (multiEntry — filter by single tag) ← added in 5L

ObjectStore: snapshots                                     ← added in 5B
  keyPath: id (nanoid)
  indexes:
    - docId            (fetch all snapshots for a document)
    - createdAt        (sort timeline)

ObjectStore: preferences
  keyPath: key
```

**Document schema (final):**
```js
{
  id: string,            // nanoid
  title: string,
  content: string,
  tags: string[],        // ← 5L
  createdAt: string,     // ISO date
  updatedAt: string,     // ISO date
  gistId: string | null, // ← 5G
  gistUrl: string | null // ← 5G
}
```

**Snapshot schema (5B):**
```js
{
  id: string,
  docId: string,
  content: string,
  label: string,         // 'Auto-save' | 'Manual save'
  createdAt: string,
  wordCount: number
}
```

### Phase 3+: Firebase Firestore (Free Tier)

**Use for:** Cloud sync, user accounts, share-by-link (alternative to URL encoding)  
**Free tier limits:** 1GB storage, 50k reads/day, 20k writes/day  
**Setup:** [Firebase Console](https://console.firebase.google.com) → Create project → Enable Firestore

```
users/
  {userId}/
    documents/
      {docId}
        - title, content, tags, createdAt, updatedAt, isPublic, gistId
    snapshots/
      {snapshotId}
        - docId, content, label, createdAt, wordCount
```

### Phase 3+: Firebase Firestore (Free Tier)

**Use for:** Cloud sync, user accounts, share-by-link  
**Free tier limits:** 1GB storage, 50k reads/day, 20k writes/day — more than enough for a portfolio project  
**Setup:** [Firebase Console](https://console.firebase.google.com) → Create project → Enable Firestore

**Collection structure:**
```
users/
  {userId}/
    documents/
      {docId}
        - title: string
        - content: string
        - createdAt: timestamp
        - updatedAt: timestamp
        - isPublic: boolean
```

**Firebase install:**
```bash
npm install firebase
```

> **Note:** Only migrate to Firebase if you want to add auth and multi-device sync. For a portfolio project, IndexedDB is sufficient and avoids the need for a Firebase account.

---

## 13. Scalability Considerations

### Performance

| Concern | Solution |
|---|---|
| Re-rendering on every keystroke | `useDebounce` delays preview by 300ms |
| Large documents causing lag | `React.memo` on PreviewPane, only re-render when debounced value changes |
| Heavy PDF export blocking UI | `html2pdf` is async — show a loading indicator |
| CodeMirror bundle size | Use dynamic `import()` to lazy-load the editor |
| AI API calls on every selection | Only trigger menu on mouseup, not on every selection change |
| IndexedDB snapshot bloat | Prune to 50 snapshots per document (5B) |
| Share-link URL length | Warn and block share for documents > 8KB (5F) |

### Code Scalability

- Context is split if it grows: separate `ThemeContext`, `DocumentContext`, `EditorContext`
- Custom hooks for each concern — easy to test and replace independently
- CSS Modules prevent style conflicts as components grow
- Barrel exports (`index.js`) keep import paths clean
- All Phase 5 features are opt-in modules — removing any one doesn't break others

### Stretch Goals (beyond Phase 5)

- [ ] Collaborative editing via Yjs + WebRTC (real-time multi-user)
- [ ] PWA support — install as desktop app, fully offline
- [ ] Custom theme builder (user-defined color schemes)
- [ ] Plugin system for custom Markdown extensions
- [ ] Firebase Auth + cloud sync across devices

---

## 14. Performance Checklist

- [ ] Lighthouse score > 90 on all four categories
- [ ] Preview debounced at 300ms — no render on every keystroke
- [ ] CodeMirror lazy-loaded (`React.lazy` + `Suspense`)
- [ ] Fonts loaded with `font-display: swap`
- [ ] Images (if any) use `loading="lazy"`
- [ ] No memory leaks — all `useEffect` cleanups in place
- [ ] Bundle size analyzed with `vite-bundle-visualizer`
- [ ] AI action menu only mounts when text is selected (5D)
- [ ] HistoryPanel snapshots loaded lazily on panel open (5B)
- [ ] Full-text search debounced at 150ms (5L)

---

## 15. Accessibility Checklist

- [ ] All toolbar buttons have `aria-label`
- [ ] Keyboard-only navigation works throughout the app
- [ ] Focus ring visible on all interactive elements
- [ ] Color contrast ratio > 4.5:1 (WCAG AA)
- [ ] Theme toggle works with `prefers-color-scheme` media query
- [ ] Screen reader announces autosave status via `aria-live`
- [ ] Editor has `role="textbox"` and descriptive `aria-label`
- [ ] Command palette has focus trap and `aria-label` (5H)
- [ ] AI action menu dismisses on Esc (5D)
- [ ] History panel is keyboard-navigable (5B)
- [ ] Share modal announced to screen readers via `role="dialog"` (5F)

---

## 16. Deployment

### Vercel (Recommended)

1. Push project to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repository
3. Framework: Vite (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click Deploy — live in ~30 seconds

### Environment Variables (Phase 5 additions)

Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_GROQ_API_KEY          ← Required for 5D (AI assistant) and 5E (title generator)
VITE_FIREBASE_API_KEY      ← Only if using Firebase sync
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
```

### Custom Domain (optional, free on Vercel)

Vercel provides a free `*.vercel.app` subdomain. You can also connect a custom domain for free if you own one.

---

## Quick Reference: All Libraries

| Library | Phase | Docs |
|---|---|---|
| React 18 | Core | https://react.dev |
| Vite | Core | https://vitejs.dev |
| CodeMirror 6 | 1 | https://codemirror.net |
| react-markdown | 1 | https://github.com/remarkjs/react-markdown |
| remark-gfm | 1 | https://github.com/remarkjs/remark-gfm |
| html2pdf.js | 3 | https://github.com/eKoopmans/html2pdf.js |
| idb (IndexedDB) | 3 | https://github.com/jakearchibald/idb |
| groq-sdk | 5D, 5E | https://console.groq.com/docs |
| cmdk | 5H | https://cmdk.paco.me |
| Firebase | Optional | https://firebase.google.com/docs |
| Vercel | Deploy | https://vercel.com/docs |

---

*Document version: 2.0 — Updated with Phase 5 features (5A–5L)*
