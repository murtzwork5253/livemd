# LiveMD Portfolio Learning & Interview Guide

This guide is written for beginner to intermediate React developers. It breaks down every core feature in the **LiveMD** codebase, explaining the **underlying React concepts**, **architectural design choices**, and **how to explain these features to technical recruiters or interviewers** to showcase your engineering maturity.

---

## 🗺️ Table of Contents

1. [State Management Architecture (Context API + useReducer)](#1-state-management-architecture-context-api--usereducer)
2. [Local-First Persistence (IndexedDB & LocalStorage)](#2-local-first-persistence-indexeddb--localstorage)
3. [Rich Editor Integration (CodeMirror & ReactMarkdown)](#3-rich-editor-integration-codemirror--reactmarkdown)
4. [Custom Hooks & Performance Tuning (useDebounce & useAutosave)](#4-custom-hooks--performance-tuning-usedebounce--useautosave)
5. [Responsive Workspace & Tab Switching](#5-responsive-workspace--tab-switching)
6. [UI Polishing: Pulsing Skeletons & Empty States](#6-ui-polishing-pulsing-skeletons--empty-states)
7. [API-Free URL Share Links (Base64 Serialization)](#7-api-free-url-share-links-base64-serialization)
8. [Git-like Version History & Custom Lookahead Diff Engine](#8-git-like-version-history--custom-lookahead-diff-engine)
9. [React Error Boundaries (Class Components)](#9-react-error-boundaries-class-components)

---

## 1. State Management Architecture (Context API + useReducer)

### 💡 The React Concept

In React, state can be managed locally within a single component using `useState`. However, when state needs to be accessed by many distant components (e.g., the editor content, active document ID, list of files, and sidebar open state are needed by the Editor, Preview, Sidebar, and Toolbar), passing props down through multiple layers of components (**prop drilling**) becomes unmaintainable.

We solve this using:

- **Context API:** Creates a global "broadcast channel" so any child component can read state directly without prop drilling.
- **useReducer Hook:** Centralizes state modifications into a single reducer function. Instead of components executing custom state changes directly, they dispatch predefined **actions** describing what happened (e.g., `SET_ACTIVE_DOC`, `TOGGLE_SIDEBAR`).

### 🛠️ How it is implemented

In [MarkdownContext.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/context/MarkdownContext.tsx) and [markdownReducer.ts](file:///C:/Users/User/PersonelProjects/livemd/src/context/markdownReducer.ts):

- `initialState` defines variables like `markdown`, `viewMode`, `theme`, `documents`, and `isSharedView`.
- `markdownReducer` takes the current `state` and an `action`, returning a new state object.

### 🎤 How to explain this in an Interview

> _"I chose the Context API combined with `useReducer` to manage global state. While Redux or Zustand are common, Context + `useReducer` is built into React and perfect for medium-sized applications. Centralizing state updates inside a reducer ensures unidirectional data flow, makes updates predictable, and makes it incredibly easy to track and debug state transitions in test suites."_

---

## 2. Local-First Persistence (IndexedDB & LocalStorage)

### 💡 The React Concept

React state resets on page reload. To build a reliable document editor, documents must persist.

- **LocalStorage:** Synchronous, blocking key-value storage. Ideal for tiny settings (like `theme` or `viewMode`) but dangerous for large document lists because it blocks the browser's main thread and has a 5MB limit.
- **IndexedDB:** An asynchronous, transactional, object-oriented database in the browser. It holds hundreds of megabytes of data without blocking UI rendering.

### 🛠️ How it is implemented

In [db.ts](file:///C:/Users/User/PersonelProjects/livemd/src/lib/db.ts):

- We use the `idb` wrapper library to simplify working with IndexedDB using Promises.
- Incremental database upgrade versioning:
  ```typescript
  export const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('documents', { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        db.createObjectStore('snapshots', { keyPath: 'id' }); // Upgraded version history
      }
    },
  });
  ```

### 🎤 How to explain this in an Interview

> _"I designed a Local-First data storage mechanism. I used LocalStorage for small config tokens like the active theme, but chose IndexedDB for documents and version history. IndexedDB runs asynchronously via transactions, meaning large document edits won't block main-thread UI interactions, and it provides a schema migration path for database upgrades."_

---

## 3. Rich Editor Integration (CodeMirror & ReactMarkdown)

### 💡 The React Concept

Creating a code editor from scratch is extremely difficult. We integrate **CodeMirror 6** (via `@uiw/react-codemirror`) for editing and **ReactMarkdown** for rendering.
To coordinate these two subsystems:

- **Ref Sharing (`useRef`):** `App.tsx` creates `editorRef` and passes it to `EditorPane`. The `Toolbar` uses this ref to programmatically inspect selections and insert Markdown markup (e.g. wrapping highlighted text with `**` for bold) without forcing complete editor re-mounts.

### 🛠️ How it is implemented

- **[EditorPane.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/components/Editor/EditorPane.tsx):** Configures CodeMirror syntax highlighting themes and keyboard layouts.
- **[PreviewPane.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/components/Preview/PreviewPane.tsx):** Renders the markdown. It uses a custom renderer for heading elements to dynamically inject slugs as HTML IDs, enabling the Table of Contents scroll anchors.

### 🎤 How to explain this in an Interview

> _"I integrated CodeMirror 6 with ReactMarkdown to handle editing and parsing. I used React Refs to bridge the gap between React's state model and CodeMirror's internal document selections. This allowed me to implement a formatting toolbar that directly manipulates selection ranges inside CodeMirror without causing expensive editor re-renders."_

---

## 4. Custom Hooks & Performance Tuning (`useDebounce` & `useAutosave`)

### 💡 The React Concept

React updates on every keystroke. If we auto-save to IndexedDB or re-render a complex Markdown preview on every single keypress, the application will lag.

- **Debouncing:** Delays execution of a function until a certain amount of idle time has passed.
- **Custom Hook:** Extracts logic so it can be reused. We built a custom `useDebounce` hook that yields a debounced string update after 300ms, and a `useAutosave` hook that automatically writes state changes to IndexedDB.

### 🛠️ How it is implemented

- **[useDebounce.ts](file:///C:/Users/User/PersonelProjects/livemd/src/hooks/useDebounce.ts):**
  ```typescript
  export function useDebounce<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(handler); // Cleanup on value change
    }, [value, delay]);
    return debounced;
  }
  ```
- **[useAutosave.ts](file:///C:/Users/User/PersonelProjects/livemd/src/hooks/useAutosave.ts):** Triggers database saves only when the debounced markdown content changes, keeping database writes clean and efficient.

### 🎤 How to explain this in an Interview

> _"To prevent input lag, I built a custom `useDebounce` hook. It holds back state propagation by 300ms. The Preview pane and the IndexedDB autosave engine listen to this debounced value instead of raw keystrokes. This reduces the number of database writes and Markdown renders by over 90% during fast typing sessions."_

---

## 5. Responsive Workspace & Tab Switching

### 💡 The React Concept

Responsive design in React sometimes requires changing structural layout components:

- **Tablet / Desktop:** Sidebar lists sit side-by-side with split panes (50/50).
- **Mobile (< 768px):** Screen sizes cannot accommodate split panes. We replace this layout with a segmented control (`Write` vs `Preview` tabs).
- **Retention of State:** We keep both panes mounted in the DOM, toggling visibility using CSS classes (e.g. `display: none`). **Why?** If we conditionally rendered them using `{tab === 'editor' ? <Editor /> : <Preview />}`, swapping tabs would destroy CodeMirror's undo/redo history, cursor position, scroll indexes, and selection ranges!

### 🛠️ How it is implemented

- **[App.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/App.tsx):** Maintains a `mobileTab` state (`'editor' | 'preview'`).
- **[App.css](file:///C:/Users/User/PersonelProjects/livemd/src/App.css):** Uses media queries to overlay the sidebar as a drawer and hide the preview panel when `.workspace` contains the `.mobile-tab-editor` class.

### 🎤 How to explain this in an Interview

> _"For the responsive mobile layout, instead of unmounting the editor and preview components to toggle views, I kept both mounted in the DOM and toggled their visibility using responsive CSS classes. This choice preserves user selection states, CodeMirror's history stack, scroll offsets, and cursor positions across tab switches."_

---

## 6. UI Polishing: Pulsing Skeletons & Empty States

### 💡 The React Concept

Static screens make apps feel unfinished.

- **Pulsing Skeletons:** Animated gray bars rendering while async database loading processes (`state.isLoading`) are running. It reduces perceived load times.
- **Empty States:** Renders a clean workspace illustration when document lists are empty. It guides the user's next action with a clear call-to-action (CTA) button.

### 🛠️ How it is implemented

- **[Sidebar.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/components/Sidebar/Sidebar.tsx):** Checks `isLoading` and renders 3 pulsing skeletons using shimmering gradient keyframe CSS animations.
- **[App.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/App.tsx):** Renders `.empty-workspace` containing a floating SVG icon if the document list is empty, and disables header action controls.

### 🎤 How to explain this in an Interview

> _"I implemented skeleton loaders in the sidebar and empty states in the workspace. While IndexedDB loads quickly, showing animated skeletons during database hydration reduces perceived load times. The empty workspace card provides clean UX, disabling header buttons (since there is nothing to export) and guiding the user with a 'Create Document' CTA."_

---

## 7. API-Free URL Share Links (Base64 Serialization)

### 💡 The React Concept

How do you let users share documents read-only without a database backend or authentication servers?
We serialize the document state directly into the URL!

- **Unicode Support:** Emojis and foreign character strings throw errors if encoded directly with native `btoa()`. We use `TextEncoder` to extract UTF-8 raw bytes, convert those to a binary character string, and convert that to Base64.
- **Query Hydration on Mount:** During application mount, the app parses URL query parameters. If it detects a `?share=...` parameter, it decodes the payload, locks the view mode to read-only Preview, and flags the shared banner.

### 🛠️ How it is implemented

- **[shareLink.ts](file:///C:/Users/User/PersonelProjects/livemd/src/lib/shareLink.ts):** Encodes/decodes payloads using standard modern UTF-8 byte encoders.
- **[App.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/App.tsx):** If query checks reveal a share, mounts the preview. Clicking "Edit Copy" saves a copy into IndexedDB, and strips the parameters from the URL using `window.history.replaceState` without reloading.

### 🎤 How to explain this in an Interview

> _"I implemented a database-free sharing feature by serializing the document title and content into a Base64 string appended to the URL. To support Unicode characters and emojis safely without deprecated functions, I utilized TextEncoder and TextDecoder. On app mount, a check intercepts the initialization flow to load this shared state and display a banner allowing users to import it into their own IndexedDB instance."_

---

## 8. Git-like Version History & Custom Lookahead Diff Engine

### 💡 The React Concept

Writing a diff comparison engine requires matching old text and new text line-by-line.

- **Lookahead Matching:** If two lines differ, the algorithm scans up to 5 lines ahead in both document arrays. If it finds a match, it correctly identifies lines that were either **inserted** (green) or **deleted** (red).
- **Snapshot Pruning:** Restores version history list, prunes older snapshot files if they exceed 50 items (preventing browser disk exhaustion), and saves backup snapshots right before restoring to act as an undo history.

### 🛠️ How it is implemented

- **[diff.ts](file:///C:/Users/User/PersonelProjects/livemd/src/lib/diff.ts):** Lookahead line matching loop returning typed arrays of deletions and additions.
- **[useVersionHistory.ts](file:///C:/Users/User/PersonelProjects/livemd/src/hooks/useVersionHistory.ts):** Manages a 5-minute background auto-save snapshot timer loop.
- **[HistoryPanel.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/components/HistoryPanel/HistoryPanel.tsx):** Renders the history list with collapsible cards showing unified line comparisons.

### 🎤 How to explain this in an Interview

> _"I built a version history module. It records snapshots every 5 minutes and on Ctrl+S, capping storage at 50 records to prevent disk exhaustion. To render changes between versions, I wrote a line-by-line lookahead diff algorithm from scratch. It compares arrays and matches block additions and removals, outputting a clear visual diff."_

---

## 9. React Error Boundaries (Class Components)

### 💡 The React Concept

In React, if a rendering exception occurs anywhere in the virtual tree, React will unmount the entire component structure, crashing the tab and showing a white screen.

- **Error Boundary:** A class-based React component. As of today, React does **not** support functional components acting as Error Boundaries.
- **Key Methods:**
  - `static getDerivedStateFromError(error)`: Updates local state to flag `hasError: true`.
  - `componentDidCatch(error, errorInfo)`: Logs the diagnostic logs to external systems.
- **Key Recovery:** By wrapping the preview pane with `ErrorBoundary` and passing `resetKey={debouncedMarkdown}`, the error boundary intercepts crashes (e.g. malformed markdown rendering bugs) and displays an inline console warning, recovering automatically as soon as the user corrects their syntax in the editor.

### 🛠️ How it is implemented

- **[ErrorBoundary.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/components/Preview/ErrorBoundary.tsx):** Class component capturing exceptions, exposing debug details, and resetting if `prevProps.resetKey !== this.props.resetKey`.
- **[PreviewPane.tsx](file:///C:/Users/User/PersonelProjects/livemd/src/components/Preview/PreviewPane.tsx):** Wraps `MemoizedMarkdown` inside the error boundary.

### 🎤 How to explain this in an Interview

> _"In React, uncaught rendering errors crash the entire application. To solve this, I built a class-based Error Boundary to wrap the markdown preview pane. I passed the debounced markdown text as a reset key. If a rendering exception happens, it renders an inline error fallback showing diagnostic logs, and automatically clears the error state and re-renders once the user resumes typing and fixes their syntax in the editor."_
