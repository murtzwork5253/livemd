# Developer Learning Guide: Version History & Snapshots

This guide documents the technical details, database design patterns, lookahead algorithms, and React patterns used to implement the **Version History & Snapshots** feature in LiveMD.

---

## 💡 Core Concept: Local-First Document Backups

A robust developer tool must prioritize **data safety**. LiveMD implements a local-first Git-like document snapshot manager.
1. **Auto-saves (Background):** Automatically logs document state snapshots every 5 minutes during active edits (if edits are detected).
2. **Manual Saves (Explicit):** Logs a snapshot instantly when the user presses `Ctrl+S` or explicitly clicks save.
3. **State Backups (Safe Restores):** Before restoring an older snapshot, the app automatically takes a "Before Restore" snapshot. If the user makes a mistake restoring, they can easily revert back to their pre-restored state.
4. **Storage Boundaries (Pruning):** Retains a maximum of 50 snapshots per document. Older records are pruned dynamically to prevent browser memory database bloat.

---

## 🏗️ Technical Architecture & Database Design

### 1. IndexedDB Schema Upgrade (Version 2 Migration)
In production, database schemas change. IndexedDB supports incremental upgrades via version triggers. We upgraded the database from Version 1 to Version 2:
```typescript
export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db: IDBPDatabase, oldVersion: number) {
    if (oldVersion < 1) {
      // Version 1 Store: Documents
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('updatedAt', 'updatedAt');
    }
    if (oldVersion < 2) {
      // Version 2 Store: Snapshots
      const snapStore = db.createObjectStore(SNAPSHOTS_STORE_NAME, { keyPath: 'id' });
      snapStore.createIndex('docId', 'docId'); // Query filter index
      snapStore.createIndex('createdAt', 'createdAt'); // Time sorting index
    }
  },
});
```

### 2. Transaction Management & Pruning
Pruning records efficiently requires running queries within a single write transaction block (`tx`) rather than creating separate transactions for each deleted record, which saves massive CPU overhead:
```typescript
export async function pruneSnapshots(docId: string, keep = 50): Promise<void> {
  const db = await dbPromise;
  const tx = db.transaction(SNAPSHOTS_STORE_NAME, 'readwrite');
  const index = tx.store.index('docId');
  const all = await index.getAll(docId);
  
  // Sort descending: newest first
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  if (all.length > keep) {
    const toDelete = all.slice(keep);
    // Delete in parallel inside the single transaction
    await Promise.all(toDelete.map((s) => tx.store.delete(s.id)));
  }
  await tx.done; // Commits transaction
}
```

---

## 🔍 Custom Lookahead Diff Algorithm

To display edits between a snapshot and the current active editor content, we implemented a custom line-by-line lookahead comparison algorithm in [diff.ts](file:///C:/Users/User/PersonelProjects/livemd/src/lib/diff.ts) without relying on large external diff libraries:

- **Lookahead Matching:** If two lines do not match, the algorithm scans up to 5 lines ahead in both arrays to detect if a line was **inserted** (added) or **deleted** (removed).
- **Fallback Replacements:** If no match is found within the lookahead window, the line is flagged as a replacement (combining a `-` deletion and a `+` insertion).
- **Diff Structure Output:** Returns an array of `{ type: 'added' | 'removed' | 'unchanged', text: string }` which is rendered as color-coded lines.

---

## ⚛️ React.js Patterns Learned

### 1. Asynchronous State Scheduling inside Effects
React flags calling `setState` synchronously within the body of a `useEffect` callback as an error (`react-hooks/set-state-in-effect`) because it can trigger synchronous cascading renders that hurt performance.
To clear the snapshots list safely when no document is active or the panel collapses, we schedule the state update to resolve asynchronously in the next microtask queue using `Promise.resolve().then(...)`:
```typescript
useEffect(() => {
  let active = true;
  if (activeDocId && isOpen) {
    getSnapshotsForDoc(activeDocId).then((snaps) => {
      if (active) {
        setSnapshots(snaps);
      }
    });
  } else {
    // Clear state asynchronously to prevent cascading renders
    Promise.resolve().then(() => {
      if (active) setSnapshots([]);
    });
  }
  return () => { active = false; };
}, [activeDocId, isOpen]);
```

### 2. State Caching via Refs (`useRef`)
To prevent auto-save timers from creating duplicate snapshots when the content hasn't changed, `useVersionHistory` maintains a local memory cache of the last saved snapshot content per document ID using a React `useRef`. Changing this cache does not trigger UI re-renders, keeping the editor typing interface highly responsive.

### 3. Drawer Transition Animations
Mounting the `HistoryPanel` permanently inside the DOM layout and toggling its visibility via `className={isOpen ? 'open' : 'collapsed'}` allows us to execute smooth sliding transitions using CSS `transform: translateX(...)` rather than abrupt DOM insertions/removals.
