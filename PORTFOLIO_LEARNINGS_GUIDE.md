# LiveMD Portfolio Learning & Interview Guide

This guide is written for React developers building LiveMD for their portfolio. It details every core feature built in this project, referencing the **exact code implementations**, **React concepts**, and **underlying architectural designs**. Use the "Interview Guide" sections to prepare for technical interview questions.

---

## 🗺️ Table of Contents

1. [Predictable State Reducers (Context API + useReducer)](#1-predictable-state-reducers-context-api--usereducer)
2. [Transactional Local Persistence (IndexedDB Schema Migrations)](#2-transactional-local-persistence-indexeddb-schema-migrations)
3. [Drill-Free Component Ref Sharing (useRef & CodeMirror)](#3-drill-free-component-ref-sharing-useref--codemirror)
4. [Timer Lifecycles & State Caching (useAutosave & useVersionHistory)](#4-timer-lifecycles--state-caching-useautosave--useversionhistory)
5. [DOM Mounting Optimization (Responsive Tab Design)](#5-dom-mounting-optimization-responsive-tab-design)
6. [Visual Polish Transitions (Skeleton Skeletons & Empty States)](#6-visual-polish-transitions-skeleton-skeletons--empty-states)
7. [Unicode-Safe URL Serialization (TextEncoder Sharing)](#7-unicode-safe-url-serialization-textencoder-sharing)
8. [Incremental Snapshot Versioning & Lookahead Diff Computations](#8-incremental-snapshot-versioning--lookahead-diff-computations)
9. [Class-Based Error Boundaries with Auto-Recovery](#9-class-based-error-boundaries-with-auto-recovery)

---

## 1. Predictable State Reducers (Context API + useReducer)

### 💡 The React Concept

Instead of managing fragmented component state via standard `useState` calls and passing handler props down to deep children (prop drilling), LiveMD centralizes state in a single store.

- **React Context:** Acts as a portal to broadcast state values down to any child component.
- **useReducer:** Centralizes state updates. Components do not edit state directly; instead, they dispatch typed **Actions**, and a pure **Reducer** function computes the next state snapshot.

### 🔍 Code Reference & Implementation

In [markdownReducer.ts](file:///C:/Users/User/PersonelProjects/livemd/src/context/markdownReducer.ts), state type definitions, initial states, and state change transitions are declared:

```typescript
export interface MarkdownState {
  markdown: string;
  theme: Theme;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  activeDocId: string | null;
  documents: Document[];
  lastSaved: Date | null;
  isLoading: boolean;
  isSharedView: boolean;
}

export type MarkdownAction =
  | { type: 'SET_MARKDOWN'; payload: string }
  | { type: 'SET_ACTIVE_DOC'; payload: { id: string | null; content: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SHARED_VIEW'; payload: boolean }
  | { type: 'SET_DOCUMENTS'; payload: Document[] };

export function markdownReducer(state: MarkdownState, action: MarkdownAction): MarkdownState {
  switch (action.type) {
    case 'SET_MARKDOWN':
      return { ...state, markdown: action.payload };
    case 'SET_ACTIVE_DOC':
      return { ...state, activeDocId: action.payload.id, markdown: action.payload.content };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SHARED_VIEW':
      return { ...state, isSharedView: action.payload };
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    default:
      return state;
  }
}
```

### 🎤 How to explain this in an Interview

> _"I designed the state management around React's Context API and the `useReducer` hook. This approach mirrors Redux patterns by isolating state mutations into a centralized reducer, making the flow of data predictable. By dispatching actions like `SET_ACTIVE_DOC`, we enforce a strict unidirectional data flow, ensuring that any UI change triggers a predictable state change."_

---

## 2. Transactional Local Persistence (IndexedDB Schema Migrations)

### 💡 The React Concept

React state is ephemeral and resets on refresh. While LocalStorage is suitable for tiny configurations, it blocks the main thread because it is synchronous, and has a 5MB storage limit.
LiveMD implements a **local-first** approach using IndexedDB. It runs asynchronously, supports transactional workflows, handles massive storage limits, and can be upgraded incrementally without deleting user data.

### 🔍 Code Reference & Implementation

In [db.ts](file:///C:/Users/User/PersonelProjects/livemd/src/lib/db.ts), the database schema is upgraded to Version 2 to store version history snapshots:

```typescript
const DB_NAME = 'livemd';
const DB_VERSION = 2; // Upgraded from 1
const STORE_NAME = 'documents';
const SNAPSHOTS_STORE_NAME = 'snapshots';

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db: IDBPDatabase, oldVersion: number) {
    // Version 1 Setup
    if (oldVersion < 1) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
        store.createIndex('title', 'title');
      }
    }
    // Version 2 Setup (Incremental Migration)
    if (oldVersion < 2) {
      if (!db.objectStoreNames.contains(SNAPSHOTS_STORE_NAME)) {
        const snapStore = db.createObjectStore(SNAPSHOTS_STORE_NAME, { keyPath: 'id' });
        snapStore.createIndex('docId', 'docId'); // Query index
        snapStore.createIndex('createdAt', 'createdAt'); // Sort index
      }
    }
  },
});
```

### 🎤 How to explain this in an Interview

> _"I built a local-first storage adapter using IndexedDB. Since writing big document content to synchronous LocalStorage can freeze UI rendering, I used IndexedDB, which handles high storage capacities asynchronously. I implemented database schema migrations, incrementing to version 2, allowing me to add a snapshots object store for version history while fully preserving existing documents."_

---

## 3. Drill-Free Component Ref Sharing (useRef & CodeMirror)

### 💡 The React Concept

React elements are normally updated by modifying their state/props. However, complex third-party widgets like CodeMirror manage their own internal state. To interact with CodeMirror without unmounting it, we must access its DOM instance directly using a React **Ref**.
Furthermore, we must share this ref between sibling components: the `Toolbar` needs to inspect and wrap selections, and `App` coordinates keyboard shortcuts. We create the `editorRef` in `App.tsx` and pass it down as a prop.

### 🔍 Code Reference & Implementation

In [useKeyboardShortcuts.ts](file:///C:/Users/User/PersonelProjects/livemd/src/hooks/useKeyboardShortcuts.ts), selection bounds are modified directly:

```typescript
export function useKeyboardShortcuts({ editorRef, onSave }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const view = editorRef.current?.view;
        if (!view) return;

        const state = view.state;
        const selection = state.selection.main;
        const from = selection.from;
        const to = selection.to;
        const selectedText = state.sliceDoc(from, to);
        const key = e.key.toLowerCase();

        if (key === 'b') {
          e.preventDefault();
          const prefix = '**';
          const suffix = '**';
          const insertText = `${prefix}${selectedText || 'text'}${suffix}`;

          view.dispatch({
            changes: { from, to, insert: insertText },
            selection: selectedText
              ? { anchor: from + insertText.length }
              : { anchor: from + prefix.length, head: from + prefix.length + 4 },
          });
          view.focus();
        }
        // ...
```

### 🎤 How to explain this in an Interview

> _"To manipulate selections inside the CodeMirror editor from the toolbar and keyboard shortcut hook, I created a React Ref in the main App component and shared it. By accessing the `EditorView` ref directly, I can run mutations on selection ranges and dispatch changes directly to CodeMirror, bypassing expensive React render cycles."_

---

## 4. Timer Lifecycles & State Caching (useAutosave & useVersionHistory)

### 💡 The React Concept

Timers (`setInterval` or `setTimeout`) in React must be managed carefully. If they are registered inside render loops, they leak memory, trigger multiple timer instances, and crash the browser.

- **Timer Registration:** Timers must be wrapped inside a `useEffect` and cleaned up by returning a clear function (`clearInterval`).
- **State Caching via Refs:** If a timer checks state values, referencing standard state variables inside `useEffect` forces the effect to recreate on every keystroke. To prevent this, we cache the values in a `useRef` (e.g. `lastSnapshotContentRef`). Modifying refs does not trigger re-renders, ensuring typing remains lag-free.

### 🔍 Code Reference & Implementation

In [useVersionHistory.ts](file:///C:/Users/User/PersonelProjects/livemd/src/hooks/useVersionHistory.ts):

```typescript
export function useVersionHistory() {
  const { state } = useMarkdown();
  const { activeDocId, markdown } = state;
  const lastSnapshotContentRef = useRef<Record<string, string>>({});

  const createSnapshot = useCallback(
    async (label: string = 'Auto-save') => {
      if (!activeDocId || !markdown.trim()) return;

      // Read cache to avoid recording duplicate snapshots
      const lastContent = lastSnapshotContentRef.current[activeDocId];
      if (markdown === lastContent) return;

      const wordCount = markdown.split(/\s+/).filter(Boolean).length;
      const newSnapshot: Snapshot = {
        id: nanoid(),
        docId: activeDocId,
        content: markdown,
        label,
        createdAt: new Date(),
        wordCount,
      };

      try {
        await saveSnapshot(newSnapshot);
        await pruneSnapshots(activeDocId, 50);
        lastSnapshotContentRef.current[activeDocId] = markdown; // Update cache
      } catch (err) {
        console.error(err);
      }
    },
    [activeDocId, markdown],
  );

  // Periodic timer runs every 5 minutes in background
  useEffect(() => {
    if (!activeDocId) return;

    const intervalId = setInterval(
      () => {
        createSnapshot('Auto-save');
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(intervalId); // Cleanup lifecycle leaks
  }, [activeDocId, createSnapshot]);

  return { createSnapshot };
}
```

### 🎤 How to explain this in an Interview

> _"I designed the background snapshot hook to run on a 5-minute timer inside `useEffect`, returning a clear handler to prevent memory leaks on unmount. To avoid saving duplicate snapshots when no changes are typed, I cached the document content inside a React Ref. This reference lookup prevents unnecessary state updates and keeps the editor input latency low."_

---

## 5. DOM Mounting Optimization (Responsive Tab Design)

### 💡 The React Concept

In responsive layouts under 768px, split-pane side-by-side editing cannot fit. We switch to a segmented tab switcher (`Write` vs `Preview`).
Instead of conditionally mounting elements like:
`{mobileTab === 'editor' ? <EditorPane /> : <PreviewPane />}`
We mount both panes permanently in the DOM and toggle their display modes using responsive CSS variables.
**Why?** If components unmount, the editor state is destroyed. The user loses their scroll position, active selection highlights, cursor coordinates, and CodeMirror's undo/redo history. Keeping them mounted maintains state seamlessly.

### 🔍 Code Reference & Implementation

In [App.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/App.tsx):

```tsx
<main className={`workspace mode-${state.viewMode} mobile-tab-${mobileTab}`}>
  {/* Segmented Control Header (Visible only on mobile screen widths) */}
  <div className="mobile-tabs-header">
    <button
      className={`mobile-tab-btn ${mobileTab === 'editor' ? 'active' : ''}`}
      onClick={() => setMobileTab('editor')}
    >
      Write
    </button>
    <button
      className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
      onClick={() => setMobileTab('preview')}
    >
      Preview
    </button>
  </div>

  {/* Both panes remain mounted inside the workspace */}
  <div className="pane editor-pane">...</div>
  <div className="pane preview-pane">...</div>
</main>
```

In [App.css](file:///C:/Users/User/PersonelProjects/livemd/src/App.css):

```css
@media (max-width: 767.98px) {
  /* Hide preview pane when in editor mobile tab */
  .workspace.mobile-tab-editor .preview-pane {
    display: none !important;
  }
  /* Hide editor pane when in preview mobile tab */
  .workspace.mobile-tab-preview .editor-pane {
    display: none !important;
  }
}
```

### 🎤 How to explain this in an Interview

> _"For mobile responsive views, I avoided unmounting the editor and preview components. Unmounting destroys CodeMirror's local variables, including active selection ranges, scroll positions, and the undo/redo stack. Instead, I kept both components permanently mounted and controlled their visibility using responsive CSS modifiers. This preserves the editing context across view toggles."_

---

## 6. Visual Polish Transitions (Skeleton Skeletons & Empty States)

### 💡 The React Concept

A premium user experience requires active feedback during slow async transitions.

- **Shimmer Skeletons:** Rendered while the database fetches files (`isLoading: true`). Skeletons pulse to show loading activity.
- **Empty States:** Renders an informative layout when all files are deleted. Rather than presenting a blank editor, it shows an explanation vector with a clear button calling `createDoc()`.

### 🔍 Code Reference & Implementation

In [Sidebar.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/components/Sidebar/Sidebar.tsx):

```tsx
<div className="sidebar-content">
  {isLoading ? (
    <div className="sidebar-skeleton-list" aria-busy="true" aria-live="polite">
      <div className="sidebar-skeleton-item pulsing" />
      <div className="sidebar-skeleton-item pulsing" />
      <div className="sidebar-skeleton-item pulsing" />
    </div>
  ) : (
    <DocumentList ... />
  )}
</div>
```

In [Sidebar.css](file:///C:/Users/User/PersonelProjects/livemd/src/components/Sidebar/Sidebar.css), shimmer animations use linear-gradients:

```css
.sidebar-skeleton-item::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  transform: translateX(-100%);
  animation: shimmer 1.6s infinite;
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

### 🎤 How to explain this in an Interview

> _"I implemented skeleton loaders in the sidebar and empty states in the workspace to improve the user experience. By displaying shimmering skeletons during database loading, we improve perceived performance. If the user deletes all files, the workspace switches to an empty state canvas with a clear CTA to create a new document, preventing the UI from rendering empty input boxes."_

---

## 7. Unicode-Safe URL Serialization (TextEncoder Sharing)

### 💡 The React Concept

The Share by Link feature encodes the document title and content into a Base64 URL parameter. This requires zero server costs and operates entirely client-side.

- **Unicode crash safety:** Native `btoa()` only supports 8-bit ASCII. Emojis and foreign character strings throw character encoding exceptions. We convert Unicode into raw bytes using `TextEncoder` before converting to Base64.
- **Query Parameter Hydration:** During mount, a `useEffect` block checks for `?share=...`. If found, it hydates the state, sets the viewMode to preview, and displays the banner.
- **URL Parameter Cleanup:** When dismissing the banner or copying the document to local files, we strip the `?share=` query parameter using `history.replaceState` to clean the browser address bar without forcing a page refresh.

### 🔍 Code Reference & Implementation

In [shareLink.ts](file:///C:/Users/User/PersonelProjects/livemd/src/lib/shareLink.ts):

```typescript
export function encodeDocument(content: string, title: string): string {
  const payload = JSON.stringify({ content, title, v: 1 });
  const utf8Bytes = new TextEncoder().encode(payload); // Safe Unicode conversion
  const binaryString = Array.from(utf8Bytes).reduce(
    (data, byte) => data + String.fromCharCode(byte),
    '',
  );
  return btoa(binaryString);
}

export function decodeDocument(encoded: string): { content: string; title: string } | null {
  try {
    const binaryString = atob(encoded);
    const bytes = new Uint8Array(binaryString.split('').map((char) => char.charCodeAt(0)));
    return JSON.parse(new TextDecoder().decode(bytes)); // Decode back to UTF-8
  } catch (err) {
    return null; // Graceful degradation on corrupt links
  }
}
```

### 🎤 How to explain this in an Interview

> _"I built a database-free sharing system by compressing the document payload directly inside URL parameters using Base64. To prevent crashes from emojis and Unicode characters in markdown, I used TextEncoder and TextDecoder. When a shared URL is opened, the app mounts the preview, and clicking 'Edit Copy' clones the document into local IndexedDB storage before stripping the query parameters via `window.history.replaceState` without a page reload."_

---

## 8. Incremental Snapshot Versioning & Lookahead Diff Computations

### 💡 The React Concept

To display historical document edits, we built a version history module. Comparing text states line-by-line requires a diff engine.

- **Lookahead Windowing:** Rather than using heavy diff packages, we wrote a line-by-line lookahead search algorithm. It loops through the old and new text lines, scanning 5 lines ahead to match insertions (`added`) and deletions (`removed`).
- **Asynchronous State Updates:** Updating React state synchronously inside an effect is flagged as an error because it causes cascading renders. When resetting the snapshots array, we wrap it in a deferred microtask via `Promise.resolve().then()`.

### 🔍 Code Reference & Implementation

In [diff.ts](file:///C:/Users/User/PersonelProjects/livemd/src/lib/diff.ts):

```typescript
export function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const diff: DiffLine[] = [];
  let o = 0,
    n = 0,
    lookAhead = 5;

  while (o < oldLines.length || n < newLines.length) {
    if (o < oldLines.length && n < newLines.length) {
      if (oldLines[o] === newLines[n]) {
        diff.push({ type: 'unchanged', text: oldLines[o] });
        o++;
        n++;
      } else {
        let foundMatch = false;
        for (let i = 1; i <= lookAhead; i++) {
          if (n + i < newLines.length && oldLines[o] === newLines[n + i]) {
            for (let j = 0; j < i; j++) diff.push({ type: 'added', text: newLines[n + j] });
            n += i;
            foundMatch = true;
            break;
          }
          if (o + i < oldLines.length && oldLines[o + i] === newLines[n]) {
            for (let j = 0; j < i; j++) diff.push({ type: 'removed', text: oldLines[o + j] });
            o += i;
            foundMatch = true;
            break;
          }
        }
        if (!foundMatch) {
          diff.push({ type: 'removed', text: oldLines[o] });
          diff.push({ type: 'added', text: newLines[n] });
          o++;
          n++;
        }
      }
    } else if (o < oldLines.length) {
      diff.push({ type: 'removed', text: oldLines[o] });
      o++;
    } else {
      diff.push({ type: 'added', text: newLines[n] });
      n++;
    }
  }
  return diff;
}
```

In [HistoryPanel.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/components/HistoryPanel/HistoryPanel.tsx):

```typescript
useEffect(() => {
  let active = true;
  if (activeDocId && isOpen) {
    getSnapshotsForDoc(activeDocId).then((snaps) => {
      if (active) {
        snaps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSnapshots(snaps);
      }
    });
  } else {
    // Async state update avoids cascading render warnings
    Promise.resolve().then(() => {
      if (active) setSnapshots([]);
    });
  }
  return () => {
    active = false;
  };
}, [activeDocId, isOpen]);
```

### 🎤 How to explain this in an Interview

> _"I implemented a version history drawer showing unified line diffs. To render modifications, I wrote a line-by-line lookahead comparison algorithm that matches added, deleted, and modified lines without external dependencies. To display the snapshot details safely on open, I retrieved snapshots asynchronously and resolved state cleanups using microtasks to prevent synchronous cascading re-renders."_

---

## 9. Class-Based Error Boundaries with Auto-Recovery

### 💡 The React Concept

If a rendering exception occurs anywhere in the virtual tree, React will unmount the entire component tree, crashing the application and presenting a white screen.

- **Error Boundary:** Intercepts crashes inside child components (like parsing failures inside `ReactMarkdown`) and renders a styled fallback error view instead of crashing. As of today, React does **not** support functional components acting as Error Boundaries; it requires a class component.
- **Auto-Recovery:** The error boundary accepts a `resetKey` prop linked to `debouncedMarkdown`. Inside `componentDidUpdate`, we check if the `resetKey` changed. When the user modifies the text inside the editor, the error boundary clears its error state automatically, rendering the preview pane cleanly once the syntax error is corrected.

### 🔍 Code Reference & Implementation

In [ErrorBoundary.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/components/Preview/ErrorBoundary.tsx):

```typescript
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  resetKey?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  // Automatic recovery when the markdown changes in the editor
  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="preview-error-fallback">
          <div className="error-fallback-content">
            <h3>Unable to render preview</h3>
            <p>An error occurred. Correct your syntax in the editor to recover.</p>
            {this.state.error && <pre className="error-details">{this.state.error.message}</pre>}
            <button className="error-retry-btn" onClick={() => this.setState({ hasError: false })}>
              Retry Preview
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 🎤 How to explain this in an Interview

> _"I implemented a class-based Error Boundary around the Markdown preview renderer. React does not support functional error boundaries. I passed the debounced markdown string as a reset key. When an exception occurs during parsing, the boundary traps it and shows diagnostic trace details. As soon as the user modifies the text, `componentDidUpdate` detects the change in the reset key and clears the error state automatically, enabling self-healing previews."_
