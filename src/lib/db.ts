import { openDB, type IDBPDatabase } from 'idb';
import type { Document } from '../context/markdownReducer';

export interface Snapshot {
  id: string;
  docId: string;
  content: string;
  label: string; // "Auto-save" or "Manual save"
  createdAt: Date | string;
  wordCount: number;
}

const DB_NAME = 'livemd';
const DB_VERSION = 2;
const STORE_NAME = 'documents';
const SNAPSHOTS_STORE_NAME = 'snapshots';

/**
 * Promise wrapper that resolves to the IndexedDB database instance.
 */
export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db: IDBPDatabase, oldVersion: number) {
    if (oldVersion < 1) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
        store.createIndex('title', 'title');
      }
    }
    if (oldVersion < 2) {
      if (!db.objectStoreNames.contains(SNAPSHOTS_STORE_NAME)) {
        const snapStore = db.createObjectStore(SNAPSHOTS_STORE_NAME, { keyPath: 'id' });
        snapStore.createIndex('docId', 'docId');
        snapStore.createIndex('createdAt', 'createdAt');
      }
    }
  },
});

/**
 * Saves or updates a document in IndexedDB.
 * @param doc The document object.
 * @returns A Promise resolving to the saved document's ID.
 */
export async function saveDocument(doc: Document): Promise<string> {
  const db = await dbPromise;
  await db.put(STORE_NAME, doc);
  return doc.id;
}

/**
 * Retrieves all saved documents from IndexedDB.
 * @returns A Promise resolving to an array of Documents.
 */
export async function getAllDocuments(): Promise<Document[]> {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
}

/**
 * Retrieves a single document by its ID.
 * @param id The document ID.
 * @returns A Promise resolving to the Document, or undefined if not found.
 */
export async function getDocument(id: string): Promise<Document | undefined> {
  const db = await dbPromise;
  return db.get(STORE_NAME, id);
}

/**
 * Deletes a document by its ID.
 * @param id The document ID to delete.
 */
export async function deleteDocument(id: string): Promise<void> {
  const db = await dbPromise;
  await db.delete(STORE_NAME, id);
}

/**
 * Saves a new snapshot in IndexedDB.
 * @param snapshot The snapshot object.
 */
export async function saveSnapshot(snapshot: Snapshot): Promise<void> {
  const db = await dbPromise;
  await db.put(SNAPSHOTS_STORE_NAME, snapshot);
}

/**
 * Retrieves all saved snapshots for a specific document ID.
 * @param docId The parent document ID.
 * @returns A Promise resolving to an array of Snapshots.
 */
export async function getSnapshotsForDoc(docId: string): Promise<Snapshot[]> {
  const db = await dbPromise;
  const tx = db.transaction(SNAPSHOTS_STORE_NAME, 'readonly');
  const index = tx.store.index('docId');
  return index.getAll(docId);
}

/**
 * Deletes a single snapshot by its ID.
 * @param id The snapshot ID to delete.
 */
export async function deleteSnapshot(id: string): Promise<void> {
  const db = await dbPromise;
  await db.delete(SNAPSHOTS_STORE_NAME, id);
}

/**
 * Prunes snapshots for a specific document, keeping only the most recent 'keep' snapshots.
 * @param docId The parent document ID.
 * @param keep The max number of snapshots to keep.
 */
export async function pruneSnapshots(docId: string, keep = 50): Promise<void> {
  const db = await dbPromise;
  const tx = db.transaction(SNAPSHOTS_STORE_NAME, 'readwrite');
  const index = tx.store.index('docId');
  const all = await index.getAll(docId);
  
  // Sort descending: newest first
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  if (all.length > keep) {
    const toDelete = all.slice(keep);
    await Promise.all(toDelete.map((s) => tx.store.delete(s.id)));
  }
  await tx.done;
}
