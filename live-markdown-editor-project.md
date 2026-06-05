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
9. [Folder Structure](#9-folder-structure)
10. [State Architecture](#10-state-architecture)
11. [Database & Storage Strategy](#11-database--storage-strategy)
12. [Scalability Considerations](#12-scalability-considerations)
13. [Performance Checklist](#13-performance-checklist)
14. [Accessibility Checklist](#14-accessibility-checklist)
15. [Deployment](#15-deployment)

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

## 9. Folder Structure

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
│   │   └── ExportModal/
│   │       ├── ExportModal.jsx
│   │       └── ExportModal.module.css
│   ├── context/
│   │   ├── MarkdownContext.jsx
│   │   └── markdownReducer.js
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   ├── useAutosave.js
│   │   ├── useKeyboardShortcuts.js
│   │   ├── useWordCount.js
│   │   └── useDocuments.js
│   ├── lib/
│   │   ├── db.js              ← IndexedDB helpers
│   │   ├── export.js          ← Export functions
│   │   └── markdownHelpers.js ← Heading parser, etc.
│   ├── styles/
│   │   ├── globals.css        ← CSS variables, resets
│   │   ├── themes.css         ← Light/dark theme variables
│   │   └── typography.css     ← Font imports, prose styles
│   ├── App.jsx
│   └── main.jsx
├── tests/
│   ├── hooks/
│   │   ├── useDebounce.test.js
│   │   └── useWordCount.test.js
│   └── lib/
│       └── markdownHelpers.test.js
├── .eslintrc.json
├── .prettierrc
├── vite.config.js
└── README.md
```

---

## 10. State Architecture

### Context Shape

```js
// context/MarkdownContext.jsx
const initialState = {
  markdown: '# Welcome to LiveMD\n\nStart writing...',
  theme: 'dark',
  viewMode: 'split',       // 'editor' | 'split' | 'preview'
  sidebarOpen: true,
  activeDocId: null,
  documents: [],
  lastSaved: null,
};
```

### Reducer Actions

```js
// context/markdownReducer.js
export function markdownReducer(state, action) {
  switch (action.type) {
    case 'SET_MARKDOWN':
      return { ...state, markdown: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_ACTIVE_DOC':
      return { ...state, activeDocId: action.payload.id, markdown: action.payload.content };
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
    default:
      return state;
  }
}
```

### Data Flow Diagram

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

---

## 11. Database & Storage Strategy

### Phase 1: localStorage

**Use for:** Single document, theme preference, last view mode  
**Limit:** ~5MB, string-only  
**Keys:**
```
livemd:content       → Raw markdown string
livemd:theme         → 'dark' | 'light'
livemd:viewMode      → 'split' | 'editor' | 'preview'
```

### Phase 2: IndexedDB (via `idb`)

**Use for:** Multiple documents with metadata  
**Limit:** Hundreds of MB — effectively unlimited for text  
**When to upgrade:** As soon as you add multi-document support in Phase 3

**Schema:**
```
Database: livemd (version 1)
  ObjectStore: documents
    keyPath: id (nanoid string)
    indexes:
      - updatedAt (for sorting by recent)
      - title (for search)
  ObjectStore: preferences
    keyPath: key
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

## 12. Scalability Considerations

### Performance

| Concern | Solution |
|---|---|
| Re-rendering on every keystroke | `useDebounce` delays preview by 300ms |
| Large documents causing lag | `React.memo` on PreviewPane, only re-render when debounced value changes |
| Heavy PDF export blocking UI | `html2pdf` is async — show a loading indicator |
| CodeMirror bundle size | Use dynamic `import()` to lazy-load the editor |

### Code Scalability

- **Context is split** if it grows: separate `ThemeContext`, `DocumentContext`, `EditorContext`
- **Custom hooks** for each concern — easy to test and replace independently
- **CSS Modules** prevent style conflicts as components grow
- **Barrel exports** (`index.js`) keep import paths clean

### Potential Future Features (stretch goals)

- [ ] Command palette (Ctrl+K) — search documents, actions
- [ ] Collaborative editing via Firebase Realtime Database or Yjs
- [ ] Custom themes (user can define their own color scheme)
- [ ] Plugin system for custom markdown extensions
- [ ] PWA support — install as desktop app, work offline
- [ ] AI writing assistant via Groq API (free tier)

---

## 13. Performance Checklist

- [ ] Lighthouse score > 90 on all four categories
- [ ] Preview debounced at 300ms — no render on every keystroke
- [ ] CodeMirror lazy-loaded (`React.lazy` + `Suspense`)
- [ ] Fonts loaded with `font-display: swap`
- [ ] Images (if any) use `loading="lazy"`
- [ ] No memory leaks — all `useEffect` cleanups in place
- [ ] Bundle size analyzed with `vite-bundle-visualizer`

---

## 14. Accessibility Checklist

- [ ] All toolbar buttons have `aria-label`
- [ ] Keyboard-only navigation works throughout the app
- [ ] Focus ring visible on all interactive elements
- [ ] Color contrast ratio > 4.5:1 (WCAG AA)
- [ ] Theme toggle works with `prefers-color-scheme` media query
- [ ] Screen reader announces autosave status via `aria-live`
- [ ] Editor has `role="textbox"` and descriptive `aria-label`

---

## 15. Deployment

### Vercel (Recommended)

1. Push project to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repository
3. Framework: Vite (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click Deploy — live in ~30 seconds

### Environment Variables (if using Firebase)

Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
```

### Custom Domain (optional, free on Vercel)

Vercel provides a free `*.vercel.app` subdomain. You can also connect a custom domain for free if you own one.

---

## Quick Reference: Key Libraries

| Library | Docs URL |
|---|---|
| React 18 | https://react.dev |
| Vite | https://vitejs.dev |
| CodeMirror 6 | https://codemirror.net |
| react-markdown | https://github.com/remarkjs/react-markdown |
| remark-gfm | https://github.com/remarkjs/remark-gfm |
| html2pdf.js | https://github.com/eKoopmans/html2pdf.js |
| idb (IndexedDB) | https://github.com/jakearchibald/idb |
| Firebase | https://firebase.google.com/docs |
| Vercel | https://vercel.com/docs |

---

*Document version: 1.0 — Generated for LiveMD portfolio project*
