import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbPromise, saveDocument, getAllDocuments, deleteDocument, getDocument } from '../../src/lib/db';
import { openDB } from 'idb';
import type { Document } from '../../src/context/markdownReducer';

vi.mock('idb', () => {
  const store = {
    put: vi.fn(),
    getAll: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };
  return {
    openDB: vi.fn().mockImplementation(() => Promise.resolve(store)),
  };
});

describe('db operations', () => {
  const sampleDoc: Document = {
    id: 'doc-123',
    title: 'Sample Note',
    content: '# Hello',
    createdAt: new Date('2026-06-06T10:00:00.000Z'),
    updatedAt: new Date('2026-06-06T10:00:00.000Z'),
  };

  beforeEach(async () => {
    const db = await dbPromise;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.put as any).mockClear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.getAll as any).mockClear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.get as any).mockClear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.delete as any).mockClear();
  });

  it('should initialize the database with correct store name and parameters', async () => {
    await dbPromise;
    expect(openDB).toHaveBeenCalledWith('livemd', 3, expect.any(Object));
  });

  it('should save/put a document in IndexedDB', async () => {
    const db = await dbPromise;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.put as any).mockResolvedValue('doc-123');

    const result = await saveDocument(sampleDoc);

    expect(db.put).toHaveBeenCalledWith('documents', sampleDoc);
    expect(result).toBe('doc-123');
  });

  it('should get all documents from IndexedDB', async () => {
    const db = await dbPromise;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.getAll as any).mockResolvedValue([sampleDoc]);

    const result = await getAllDocuments();

    expect(db.getAll).toHaveBeenCalledWith('documents');
    expect(result).toEqual([sampleDoc]);
  });

  it('should get a single document by id', async () => {
    const db = await dbPromise;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.get as any).mockResolvedValue(sampleDoc);

    const result = await getDocument('doc-123');

    expect(db.get).toHaveBeenCalledWith('documents', 'doc-123');
    expect(result).toEqual(sampleDoc);
  });

  it('should delete a document by id', async () => {
    const db = await dbPromise;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.delete as any).mockResolvedValue(undefined);

    await deleteDocument('doc-123');

    expect(db.delete).toHaveBeenCalledWith('documents', 'doc-123');
  });
});
