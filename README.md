# LiveMD — Live Markdown Editor

> A production-grade, split-pane Markdown editor built with React, TypeScript, and Vite. Features a live rendering preview, CodeMirror syntax highlighting, IndexedDB multi-document management, automatic local saving, and a polished developer-focused UI.

---

## 🎨 Visual Direction

LiveMD is designed around a **Dark Editorial / Developer Tool** aesthetic (VS Code meets Notion). It uses a clean, distraction-free typography system, subtle border highlights, and muted color accents optimized for reading and coding comfort.

---

## ✨ Features

- **Split-Pane Editing & Live Preview:** Fully synchronised scrolling, syntax highlighting powered by CodeMirror, and real-time GitHub-flavored rendering.
- **Multi-Document Support:** Open, rename, search, and delete documents stored locally on your device via **IndexedDB** (`idb`).
- **Autosave & Save Status:** Edits are automatically saved in the background with a visual status bar showing when they were last saved.
- **Segmented Mobile Layout:** Adapts responsively down to mobile dimensions:
  - **Desktop (> 1024px):** Full-sized split layout with draggable pane resizing.
  - **Tablet (768px - 1024px):** Side-by-side layout with collapsible document sidebar.
  - **Mobile (< 768px):** A segmented pill selector (`Write` vs `Preview`) and a slide-over sidebar drawer overlay.
- **Export Formats:** One-click download of documents to:
  - Raw Markdown source file (`.md`)
  - Rendered structure file (`.html`)
  - PDF export (*Coming Soon*)
- **Premium Loading & Empty States:** Animated skeleton shimmers load during database initialization, and a vector empty canvas is displayed if no documents remain.
- **Robust Error Recovery:** Class-based React **Error Boundary** traps rendering or markdown syntax crashes inside the preview, recovering automatically as soon as the user corrects their input.

---

## ⌨️ Keyboard Shortcuts

Speed up your writing workflow with editor hotkeys:

| Action | Shortcut | Toolbar Output |
| :--- | :--- | :--- |
| **Bold** | `Ctrl + B` / `Cmd + B` | `**selected text**` |
| *Italic* | `Ctrl + I` / `Cmd + I` | `*selected text*` |
| ~~Strikethrough~~ | `Ctrl + Shift + X` | `~~selected text~~` |
| `Code` | `Ctrl + \`` | `` `selected text` `` |
| Link | `Ctrl + K` / `Cmd + K` | `[selected text](url)` |
| Save Document | `Ctrl + S` / `Cmd + S` | Triggers immediate database write |

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
├── components/          # UI Components
│   ├── Editor/          # CodeMirror Wrapper
│   ├── Preview/         # ReactMarkdown Renderer & Error Boundary
│   ├── Sidebar/         # Collapsible Document List with Search
│   ├── StatusBar/       # Word count, read time, autosave indicator
│   ├── Toolbar/         # Action buttons wrapping markdown symbols
│   └── ExportModal/     # Export file download picker
├── context/             # AppState Context (useReducer)
├── hooks/               # Custom React Hooks (useAutosave, useDebounce, useDocuments, etc.)
├── lib/                 # Third-party utilities (IndexedDB schema, export download triggers)
├── styles/              # Global variables, typography tokens, light/dark themes
├── App.tsx              # Main Workspace Coordinator
└── main.tsx             # DOM Root mounter
```

### State Management
All application states (documents list, view modes, themes, active document details) are handled using a single unified React Context and Reducer (`markdownReducer`). State variables like theme and view mode are synced back to localStorage for persistence across reloads.
