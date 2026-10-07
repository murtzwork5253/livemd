import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  backupFilename,
  createBackupBundle,
  restoreBackupFromText,
  validateBackupFile,
} from '../../src/lib/backup';
import { bulkPut, getAllDocuments, getAllSnapshots } from '../../src/lib/db';
import { BACKUP_FORMAT, BACKUP_VERSION, LIMITS } from '../../src/lib/validation';
import type { Document, Snapshot } from '../../src/context/markdownReducer';

vi.mock('../../src/lib/db', () => ({
  getAllDocuments: vi.fn(),
  getAllSnapshots: vi.fn(),
  bulkPut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('nanoid', () => {
  let counter = 0;
  return { nanoid: vi.fn(() => `generated${(counter += 1)}`) };
});

const mockedGetAllDocuments = vi.mocked(getAllDocuments);
const mockedGetAllSnapshots = vi.mocked(getAllSnapshots);
const mockedBulkPut = vi.mocked(bulkPut);

const existingDoc: Document = {
  id: 'doc-existing',
  title: 'Existing',
  content: '# Existing',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

const existingSnap: Snapshot = {
  id: 'snap-existing',
  docId: 'doc-existing',
  content: '# Existing',
  label: 'Manual Save',
  createdAt: new Date('2026-01-02T00:00:00.000Z'),
  wordCount: 1,
};

/** Builds a well-formed bundle, with per-test overrides. */
function bundle(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: '2026-07-25T10:00:00.000Z',
    documents: [
      {
        id: 'doc-imported',
        title: 'Imported',
        content: '# Imported',
        tags: ['notes'],
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-02T00:00:00.000Z',
      },
    ],
    snapshots: [
      {
        id: 'snap-imported',
        docId: 'doc-imported',
        content: '# Imported v1',
        label: 'Auto-save',
        createdAt: '2026-05-01T12:00:00.000Z',
        wordCount: 2,
      },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetAllDocuments.mockResolvedValue([]);
  mockedGetAllSnapshots.mockResolvedValue([]);
  mockedBulkPut.mockResolvedValue(undefined);
});

describe('createBackupBundle', () => {
  it('captures documents and snapshots with ISO dates', async () => {
    mockedGetAllDocuments.mockResolvedValue([{ ...existingDoc, tags: ['a'] }]);
    mockedGetAllSnapshots.mockResolvedValue([existingSnap]);

    const result = await createBackupBundle();

    expect(result.format).toBe(BACKUP_FORMAT);
    expect(result.version).toBe(BACKUP_VERSION);
    expect(result.documents).toEqual([
      {
        id: 'doc-existing',
        title: 'Existing',
        content: '# Existing',
        tags: ['a'],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ]);
    expect(result.snapshots[0].createdAt).toBe('2026-01-02T00:00:00.000Z');
  });

  it('omits an empty tags array', async () => {
    mockedGetAllDocuments.mockResolvedValue([{ ...existingDoc, tags: [] }]);
    const result = await createBackupBundle();
    expect(result.documents[0]).not.toHaveProperty('tags');
  });

  it('round-trips through JSON back into the library', async () => {
    mockedGetAllDocuments.mockResolvedValue([existingDoc]);
    mockedGetAllSnapshots.mockResolvedValue([existingSnap]);
    const text = JSON.stringify(await createBackupBundle());

    // Restore into an empty library.
    mockedGetAllDocuments.mockResolvedValue([]);
    mockedGetAllSnapshots.mockResolvedValue([]);
    const result = await restoreBackupFromText(text);

    expect(result.ok).toBe(true);
    const [docs, snaps] = mockedBulkPut.mock.calls[0];
    expect(docs).toEqual([existingDoc]);
    expect(snaps).toEqual([existingSnap]);
  });
});

describe('backupFilename', () => {
  it('is dated', () => {
    expect(backupFilename(new Date('2026-07-25T10:00:00.000Z'))).toBe(
      'livemd-backup-2026-07-25.json',
    );
  });
});

describe('validateBackupFile', () => {
  it('accepts a JSON file within the size limit', () => {
    const file = new File(['{}'], 'backup.json', { type: 'application/json' });
    expect(validateBackupFile(file).ok).toBe(true);
  });

  it('accepts a .json extension without a MIME type', () => {
    const file = new File(['{}'], 'backup.json', { type: '' });
    expect(validateBackupFile(file).ok).toBe(true);
  });

  it('rejects non-JSON, empty, and oversized files', () => {
    expect(validateBackupFile(new File(['x'], 'notes.md', { type: 'text/markdown' })).ok).toBe(
      false,
    );
    expect(validateBackupFile(new File([], 'backup.json', { type: 'application/json' })).ok).toBe(
      false,
    );

    const huge = new File(['x'], 'backup.json', { type: 'application/json' });
    Object.defineProperty(huge, 'size', { value: LIMITS.backupFileMaxBytes + 1 });
    expect(validateBackupFile(huge).ok).toBe(false);
  });
});

describe('restoreBackupFromText', () => {
  it('imports documents and snapshots', async () => {
    const result = await restoreBackupFromText(JSON.stringify(bundle()));

    expect(result).toMatchObject({
      ok: true,
      value: { documentsImported: 1, snapshotsImported: 1, renamedIds: 0 },
    });
    const [docs, snaps] = mockedBulkPut.mock.calls[0];
    expect(docs[0].id).toBe('doc-imported');
    expect(docs[0].createdAt).toBeInstanceOf(Date);
    expect(snaps[0].docId).toBe('doc-imported');
  });

  it('rejects malformed JSON and foreign files', async () => {
    expect(await restoreBackupFromText('not json')).toEqual({
      ok: false,
      error: 'Backup file is not valid JSON.',
    });
    expect((await restoreBackupFromText(JSON.stringify({ format: 'other' }))).ok).toBe(false);
    expect((await restoreBackupFromText(JSON.stringify(bundle({ version: 99 })))).ok).toBe(false);
  });

  it('never overwrites an existing document, re-keying collisions instead', async () => {
    mockedGetAllDocuments.mockResolvedValue([{ ...existingDoc, id: 'doc-imported' }]);

    const result = await restoreBackupFromText(JSON.stringify(bundle()));

    expect(result).toMatchObject({ ok: true, value: { documentsImported: 1, renamedIds: 1 } });
    const [docs, snaps] = mockedBulkPut.mock.calls[0];
    expect(docs[0].id).not.toBe('doc-imported');
    expect(docs[0].title).toBe('Imported');
    // The snapshot follows its document to the new id.
    expect(snaps[0].docId).toBe(docs[0].id);
  });

  it('re-keys colliding snapshot ids', async () => {
    mockedGetAllSnapshots.mockResolvedValue([{ ...existingSnap, id: 'snap-imported' }]);

    const result = await restoreBackupFromText(JSON.stringify(bundle()));

    expect(result.ok).toBe(true);
    const [, snaps] = mockedBulkPut.mock.calls[0];
    expect(snaps[0].id).not.toBe('snap-imported');
  });

  it('skips records that fail the schema instead of repairing them', async () => {
    const text = JSON.stringify(
      bundle({
        documents: [
          bundle().documents[0],
          { id: 'bad id!', title: 'x', content: '', createdAt: 'x', updatedAt: 'x' },
          { id: 'doc-nodate', title: 'x', content: '' },
        ],
        snapshots: [bundle().snapshots[0], { id: 'snap-bad', docId: 'doc-imported' }],
      }),
    );

    const result = await restoreBackupFromText(text);

    expect(result).toMatchObject({
      ok: true,
      value: {
        documentsImported: 1,
        documentsSkipped: 2,
        snapshotsImported: 1,
        snapshotsSkipped: 1,
      },
    });
  });

  it('drops snapshots whose document is not part of the restore', async () => {
    const text = JSON.stringify(
      bundle({
        snapshots: [{ ...bundle().snapshots[0], docId: 'doc-unknown' }],
      }),
    );

    const result = await restoreBackupFromText(text);
    expect(result).toMatchObject({ ok: true, value: { snapshotsSkipped: 1 } });
  });

  it('reports a bundle with nothing restorable rather than writing', async () => {
    const result = await restoreBackupFromText(
      JSON.stringify(bundle({ documents: [], snapshots: [] })),
    );

    expect(result.ok).toBe(false);
    expect(mockedBulkPut).not.toHaveBeenCalled();
  });

  it('rejects a bundle over the record ceiling before validating it', async () => {
    const text = JSON.stringify(
      bundle({ documents: new Array(LIMITS.backupMaxDocuments + 1).fill({}) }),
    );
    expect((await restoreBackupFromText(text)).ok).toBe(false);
    expect(mockedBulkPut).not.toHaveBeenCalled();
  });
});
