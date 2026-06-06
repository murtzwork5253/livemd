import { openDB } from 'idb';
import type { Document } from '../context/markdownReducer';

const DB_NAME = 'livemd';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

/**
 * Promise wrapper that resolves to the IndexedDB database instance.
 */
export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('updatedAt', 'updatedAt');
      store.createIndex('title', 'title');
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
