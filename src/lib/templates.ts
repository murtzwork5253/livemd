export interface Template {
  id: string;
  label: string;
  description: string;
  icon: string;
  getTitle: () => string;
  getContent: () => string;
}

export const TEMPLATES: Template[] = [
  {
    id: 'blog-post',
    label: 'Blog post',
    description: 'Detailed tutorial article on building CodeMirror editors in React',
    icon: '✍️',
    getTitle: () => 'How to Build a Custom CodeMirror Editor in React',
    getContent: () => `# How to Build a Custom CodeMirror Editor in React

In modern web development, standard textareas are no longer sufficient for complex text manipulation. Whether you are building a blog platform, a code playground, or a distraction-free markdown tool like **LiveMD**, a rich code editor is essential.

In this tutorial, we will walk through building a modular, custom text editor in React using CodeMirror 6.

> "CodeMirror 6 is a complete rewrite of the classic text editor library. It is designed to be highly modular, mobile-friendly, and accessible."

---

## Why CodeMirror 6?

Unlike its predecessor (CodeMirror 5), version 6 is split into dozens of small packages. This design yields major benefits:
- **Tree shaking**: You only import the extensions you actually use.
- **Mobile compliance**: Full support for virtual keyboards and touch screen gestures.
- **WAI-ARIA Accessibility**: Out-of-the-box support for screen readers.

## 🛠️ Step 1: Install Dependencies

Let's install the core packages needed to render CodeMirror in a React application.

\`\`\`bash
npm install @uiw/react-codemirror @codemirror/lang-markdown @codemirror/theme-one-dark
\`\`\`

## 💻 Step 2: Implementation

Here is a full code example of a React component rendering CodeMirror with markdown syntax highlighting and the One Dark theme enabled.

\`\`\`tsx
import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

export function CustomEditor() {
  const [value, setValue] = useState('# Welcome to LiveMD');

  return (
    <div className="editor-container">
      <CodeMirror
        value={value}
        height="400px"
        extensions={[markdown()]}
        theme={oneDark}
        onChange={(val) => setValue(val)}
      />
    </div>
  );
}
\`\`\`

## ⚙️ Comparing Editor Features

Below is a quick comparison of standard editor platforms:

| Feature | TextArea | CodeMirror 6 | Monaco Editor |
| :--- | :--- | :--- | :--- |
| **Performance** | High | High | Moderate (Heavy load) |
| **Mobile compliance**| Perfect | High | Poor |
| **Extension Model** | None | Modular Plugins | Monolithic |

## Conclusion

Building custom editors with CodeMirror 6 gives you maximum flexiblity. By importing only the exact plugins you need, you can keep bundle sizes small while maintaining high quality accessibility.

*Published on ${new Date().toLocaleDateString('en-GB')} by Antigravity*`,
  },
  {
    id: 'readme',
    label: 'README',
    description:
      'Comprehensive repository README with shields, TOC, roadmap, and contribution guide',
    icon: '📦',
    getTitle: () => 'README',
    getContent: () => `# 📓 LiveMD — Premium Offline Markdown Editor

[![Build Status](https://img.shields.io/github/actions/workflow/status/user/livemd/build.yml?branch=main&style=flat-square)](https://github.com)
[![Version Badge](https://img.shields.io/github/v/release/user/livemd?style=flat-square&color=blue)](https://github.com)
[![License](https://img.shields.io/github/license/user/livemd?style=flat-square&color=green)](https://github.com)
[![Tech Stack](https://img.shields.io/badge/Tech_Stack-React_19_|_TypeScript_|_Vite-purple?style=flat-square)](https://github.com)

**LiveMD** is a distraction-free, privacy-first offline markdown editor built using React 19, TypeScript, and IndexedDB. It features real-time HTML rendering, lookahead word-level difference calculations in version history, and unicode-safe share links.

---

## 🗺️ Table of Contents
1. [Key Features](#-key-features)
2. [Getting Started](#-getting-started)
3. [Environment Variables](#-environment-variables)
4. [Project Structure](#-project-structure)
5. [Roadmap](#-roadmap)
6. [Contributing](#-contributing)
7. [License](#-license)

---

## ✨ Key Features

- **📂 Local-First Database**: Full transactional document saves and auto-snapshots using browser IndexedDB.
- **⚡ Diff Engine**: Word-level difference highlighting comparing live edits against historical version history snapshots.
- **🔗 Short URL Sharing**: Micro-compressed URLs utilizing DEFLATE binary encoding for safe sharing.
- **🌓 Adaptive Theme**: Automatic system theme detection with manually togglable light and dark modes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn package managers

### Installation
1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/your-username/livemd.git
   cd livemd
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Launch development server:
   \`\`\`bash
   npm run dev
   \`\`\`

---

## ⚙️ Environment Variables

Create a \`.env\` file in the root directory to customize the dev environments:

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| \`VITE_PORT\` | Integer | \`5173\` | Dev server port connection |
| \`VITE_API_BASE\` | String | \`https://api.livemd.local\` | Fallback collaboration API endpoints |

---

## 📅 Roadmap

- [x] Integrate CodeMirror 6 with custom search panel.
- [x] Custom glassmorphic Settings modal with dark/light themes.
- [ ] Real-time multi-user editing peer-to-peer using WebRTC.
- [ ] Export directly to PDF layouts with customizable styling.

---

## 🤝 Contributing

We welcome contributions to help improve LiveMD!
1. Fork this repository.
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`).
3. Commit your changes (\`git commit -m 'feat: add amazing feature'\`).
4. Push to the branch (\`git push origin feature/amazing-feature\`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.`,
  },
  {
    id: 'meeting-notes',
    label: 'Meeting notes',
    description: 'Sprint planning and alignment notes with action items and decision logs',
    icon: '📋',
    getTitle: () => `Meeting notes — ${new Date().toLocaleDateString('en-GB')}`,
    getContent:
      () => `# 📋 Meeting Notes: Sprint Alignment — ${new Date().toLocaleDateString('en-GB')}

**Facilitator:** Product Owner  
**Date & Time:** ${new Date().toLocaleDateString('en-GB')} 10:00 AM UTC  
**Attendees:** Lead Developer, UX Designer, QA Engineer, Project Manager  

---

## 🎯 Meeting Agenda

1. Review progress on Offline Snapshot Versioning.
2. Align on the responsive layout transitions for mobile tabs.
3. Review open security issues inside project audits.

---

## 🗣️ Discussion Notes

### Topic 1: IndexedDB Snapshot pruner
- The Lead Developer reported that auto-snapshots are successfully created every 5 minutes.
- However, we noticed high DB volume when documents grew large. 
- **Solution:** Restrict snapshot retention limit to 50 versions per document. A pruning script will trigger on every save.

### Topic 2: Mobile Pane Toggle
- The UX Designer presented wireframes of the mobile transition layout.
- The editor and preview panes will toggle via tabs on screens smaller than 768px.
- Split screen view will automatically be hidden on mobile screen sizes.

---

## 📝 Decisions Made

| Issue | Decided Path | Rationale | Status |
| :--- | :--- | :--- | :--- |
| **Max Snapshot Limit** | capped at 50 | Prevent IndexedDB buffer overload | Approved |
| **Dev Environment Port** | Set to 5173 | Consistency across container setups | Approved |

---

## 🚀 Action Items

- [ ] Implement snapshot database pruner in \`db.ts\` &mdash; *Lead Developer (Due: next Friday)*
- [ ] Integrate CSS breakpoints for mobile tab toggling &mdash; *UX Designer (Due: next Wednesday)*
- [ ] Set up continuous integration build step for lint checks &mdash; *QA Engineer (Due: next Monday)*

---

## 📅 Next Meeting

- **Topic:** Sprint Review & Demo
- **Date:** ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
- **Time:** 10:00 AM UTC`,
  },
  {
    id: 'tech-spec',
    label: 'Technical spec',
    description: 'Engineering design document describing offline version control via IndexedDB',
    icon: '⚙️',
    getTitle: () => 'Technical spec',
    getContent: () => `# Technical Specification: Offline Snapshot Version Control

**Author:** Lead Engineer  
**Status:** Approved  
**Last updated:** ${new Date().toLocaleDateString('en-GB')}  
**Target Delivery:** Sprint 12  

---

## 1. Executive Summary

LiveMD operates entirely client-side to ensure user privacy and maximum offline reliability. This specification outlines the implementation of transactional local saving and incremental version history tracking inside IndexedDB.

## 2. Goals & Non-Goals

### Goals
- Auto-save text updates locally using debounced hooks.
- Create historical snapshots manually on \`Ctrl + S\` or automatically every 5 minutes.
- Retrieve and render inline line-by-line diffs of changes within the history sidebar.

### Non-Goals
- Real-time multi-client syncing over remote network targets.
- Local system folder reads/writes directly from the native desktop filesystem.

---

## 3. Database Schema Design

We will use **IndexedDB** wrapped in the lightweight helper library \`idb\`. 

\`\`\`typescript
export interface Document {
  id: string;      // UUID/nanoid generated on create
  title: string;   // User-defined string
  content: string; // Raw markdown text content
  createdAt: Date;
  updatedAt: Date;
}

export interface Snapshot {
  id: string;
  docId: string;   // Reference key to Document.id
  content: string; // Captured text content state
  label: string;   // E.g., "Auto-save", "Manual Save"
  createdAt: Date;
  wordCount: number;
}
\`\`\`

---

## 4. System Flow & Sequence

The following sequence details how changes trigger saving and pruning operations:

\`\`\`
[User Types] ---> Debounce (1000ms) ---> Update "documents" store
                                                  |
                                                  v
                                          [Every 5 minutes]
                                                  |
                                                  v
                                        Save Snapshot to DB
                                                  |
                                                  v
                                      Prune oldest > 50 entries
\`\`\`

---

## 5. Technology Trade-offs

| Alternative | Pros | Cons |
| :--- | :--- | :--- |
| **LocalStorage** | Extremely simple API | Synchronous block, capped at 5MB |
| **IndexedDB** (Chosen) | Asynchronous, transactional, high storage limit | More complex callback wrapper API |
| **SQLite (WASM)** | Full SQL queries supported | Heavy bundle load overhead (1MB+) |

---

## 6. Open Concerns

- **DB Storage Exhaustion**: Safari limits database storage limits strictly based on device size.
- **Mitigation Strategy**: Implement pruning logic on database loading stages.`,
  },
  {
    id: 'daily-journal',
    label: 'Daily journal',
    description: 'Work log, daily goals, reflection, and priorities layout',
    icon: '📔',
    getTitle: () =>
      `${new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
    getContent: () => `# ${new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}

## 🌟 Mindset & Gratitude
- **Gratitude Focus**: What is one thing I am thankful for today?
- **Primary Goal**: The single most important task to make today a success.

---

## 📅 Daily Time Block Log

- **09:00 - 10:00**: Morning check-in, emails, and sprint sync meeting.
- **10:00 - 12:00**: Deep Work &mdash; implementing the Settings Modal layout.
- **12:00 - 13:00**: Lunch & walk outdoors.
- **13:00 - 15:00**: Deep Work &mdash; writing keyboard shortcut event handlers and tests.
- **15:00 - 16:30**: Team debugging review session.
- **16:30 - 18:00**: Documentation updates and preparing PR descriptions.

---

## 🏆 Key Achievements & Wins Today

- [x] Fixed search panel wrap layout using CSS flexbox divider breaks.
- [x] Achieved 100% test coverage for key format shortcuts in \`useKeyboardShortcuts.test.ts\`.
- [x] Cleared moderate dependency security warnings via npm audit fixes.

---

## 🪵 Blockers & Learnings
- **Blocker**: CodeMirror search panel overrides CSS classes at runtime with specific CSS weights.
- **Resolution**: Appended the \`!important\` flag to custom overrides in \`EditorPane.css\`.

---

## 🎯 Tomorrow's Priority Matrix

1. **Implement PDF Exporter**: Integrate standard custom styling for PDF exports.
2. **Review Collaboration System**: Analyze WebRTC socket server setup specifications.
3. **Refine Focus Mode UI**: Clean styling for empty states.`,
  },
  {
    id: 'api-docs',
    label: 'API documentation',
    description: 'Detailed REST API specification for document sync and sharing endpoints',
    icon: '🔌',
    getTitle: () => 'API documentation',
    getContent: () => `# 🔌 LiveMD Collaboration Server API Documentation

The LiveMD Collaboration Server endpoint allows syncing document state over cloud sync setups and generating short share URLs.

## Base URL
\`https://api.livemd.app/v1\`

## Authentication
All write endpoints require a Bearer token:
\`\`\`http
Authorization: Bearer <your_access_token>
\`\`\`

---

## Endpoints

### 1. GET /documents
Retrieve a paginated list of synchronized user documents.

#### Request
\`GET /api/v1/documents?page=1&limit=10\`

#### Example cURL Request
\`\`\`bash
curl -X GET "https://api.livemd.app/v1/documents?page=1&limit=10" \
     -H "Authorization: Bearer mock_token_123"
\`\`\`

#### Success Response (200 OK)
\`\`\`json
{
  "status": "success",
  "data": [
    {
      "id": "doc_983js",
      "title": "Welcome to LiveMD",
      "updatedAt": "2026-07-06T12:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 24
  }
}
\`\`\`

---

### 2. POST /documents
Create a new synced document.

#### Request
\`POST /api/v1/documents\`

#### Parameters
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| \`title\` | String | Yes | Document title. |
| \`content\` | String | Yes | Raw Markdown content payload. |

#### Example Body Payload
\`\`\`json
{
  "title": "Weekly Report",
  "content": "# Weekly Report\\n\\nProgress details go here."
}
\`\`\`

#### Error Response (400 Bad Request)
\`\`\`json
{
  "status": "error",
  "message": "Missing required field: content",
  "code": "MISSING_FIELD"
}
\`\`\`

---

### 3. GET /share/:key
Resolve a short share key back to compressed document data.

#### Request
\`GET /api/v1/share/sh_9a8B3\`

#### Success Response (200 OK)
\`\`\`json
{
  "title": "Shared Document",
  "compressedData": "H4sIAAAAAAAACp1Y23IbxxH9lQ7..."
}
\`\`\``,
  },
];

export default TEMPLATES;
