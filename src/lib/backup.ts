/**
 * Whole-library backup and restore.
 *
 * IndexedDB is the only copy of a user's work, and it can be lost to browser
 * eviction, a cleared profile, or a switched device. A backup is a single
 * self-contained JSON bundle holding every document *and* its version history,
 * so the library can be rebuilt anywhere.
 *
 * Restores are additive: an imported record whose id collides with something
 * already stored is given a fresh id instead of overwriting it. Importing the
 * wrong file can therefore duplicate documents, but never destroy them.
 */

import { nanoid } from 'nanoid';
import { bulkPut, getAllDocuments, getAllSnapshots } from './db';
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  LIMITS,
  validateBackupDocument,
  validateBackupEnvelope,
  validateBackupSnapshot,
  type BackupDocument,
  type BackupSnapshot,
  type ValidationResult,
} from './validation';
import type { Document, Snapshot } from '../context/markdownReducer';

/** The serialized bundle written to disk. */
export interface BackupBundle {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  /** ISO timestamp of when the backup was taken. */
  exportedAt: string;
  documents: BackupDocument[];
  snapshots: BackupSnapshot[];
}

/** Summary of what a restore actually wrote, surfaced to the user. */
export interface RestoreReport {
  documentsImported: number;
  documentsSkipped: number;
  snapshotsImported: number;
  snapshotsSkipped: number;
  /** Imported records that collided with existing ids and were re-keyed. */
  renamedIds: number;
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/**
 * Reads every document and snapshot out of IndexedDB into a backup bundle.
 * @returns The bundle, with all dates normalized to ISO strings.
 */
export async function createBackupBundle(): Promise<BackupBundle> {
  const [documents, snapshots] = await Promise.all([getAllDocuments(), getAllSnapshots()]);

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    documents: documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      ...(doc.tags?.length ? { tags: doc.tags } : {}),
      createdAt: toIso(doc.createdAt),
      updatedAt: toIso(doc.updatedAt),
    })),
    snapshots: snapshots.map((snap) => ({
      id: snap.id,
      docId: snap.docId,
      content: snap.content,
      label: snap.label,
      createdAt: toIso(snap.createdAt),
      wordCount: snap.wordCount,
    })),
  };
}

/**
 * Builds the suggested filename for a backup, e.g. `livemd-backup-2026-07-25.json`.
 * @param date The backup timestamp (defaults to now).
 * @returns The filename including extension.
 */
export function backupFilename(date: Date = new Date()): string {
  return `livemd-backup-${date.toISOString().slice(0, 10)}.json`;
}

/**
 * Exports the full library and triggers a browser download.
 * @returns The filename the browser was asked to save.
 */
export async function downloadBackup(): Promise<string> {
  const bundle = await createBackupBundle();
  const filename = backupFilename(new Date(bundle.exportedAt));
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return filename;
}

/**
 * Checks an incoming backup file against the strict schema (JSON MIME/extension
 * and size ceiling) before any of it is read into memory.
 * @param file The user-selected file.
 * @returns The validated file, or a rejection reason.
 */
export function validateBackupFile(file: File): ValidationResult<File> {
  if (!(file instanceof File)) return { ok: false, error: 'Not a valid file.' };
  if (file.size <= 0) return { ok: false, error: 'That backup file is empty.' };
  if (file.size > LIMITS.backupFileMaxBytes) {
    const maxMb = Math.round(LIMITS.backupFileMaxBytes / (1024 * 1024));
    return { ok: false, error: `Backup file is too large (max ${maxMb} MB).` };
  }
  const looksJson = file.type === 'application/json' || /\.json$/i.test(file.name);
  if (!looksJson) return { ok: false, error: 'Please choose a .json backup file.' };
  return { ok: true, value: file };
}

/**
 * Validates and restores a backup bundle from its raw JSON text.
 *
 * Records are validated one by one; anything failing the schema is skipped and
 * counted rather than coerced into storage. Ids that collide with existing data
 * are re-keyed (snapshot references are remapped to match), and snapshots left
 * pointing at no known document are dropped.
 *
 * @param text The raw file contents.
 * @returns A report of what was written, or a rejection reason.
 */
export async function restoreBackupFromText(
  text: string,
): Promise<ValidationResult<RestoreReport>> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Backup file is not valid JSON.' };
  }

  const envelope = validateBackupEnvelope(parsed);
  if (!envelope.ok) return envelope;

  const [existingDocs, existingSnaps] = await Promise.all([getAllDocuments(), getAllSnapshots()]);
  const usedDocIds = new Set(existingDocs.map((d) => d.id));
  const usedSnapIds = new Set(existingSnaps.map((s) => s.id));

  /** Maps a backup docId to the id it was actually stored under. */
  const docIdMap = new Map<string, string>();
  const documents: Document[] = [];
  let documentsSkipped = 0;
  let renamedIds = 0;

  for (const raw of envelope.value.documents) {
    const result = validateBackupDocument(raw);
    if (!result.ok) {
      documentsSkipped += 1;
      continue;
    }
    const doc = result.value;
    let id = doc.id;
    if (usedDocIds.has(id)) {
      id = nanoid();
      renamedIds += 1;
    }
    usedDocIds.add(id);
    docIdMap.set(doc.id, id);
    documents.push({
      id,
      title: doc.title,
      content: doc.content,
      ...(doc.tags ? { tags: doc.tags } : {}),
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    });
  }

  const snapshots: Snapshot[] = [];
  let snapshotsSkipped = 0;

  for (const raw of envelope.value.snapshots) {
    const result = validateBackupSnapshot(raw);
    if (!result.ok) {
      snapshotsSkipped += 1;
      continue;
    }
    const snap = result.value;
    const docId = docIdMap.get(snap.docId);
    // Orphaned history (its document was skipped or absent) has nothing to restore onto.
    if (!docId) {
      snapshotsSkipped += 1;
      continue;
    }
    let id = snap.id;
    if (usedSnapIds.has(id)) {
      id = nanoid();
      renamedIds += 1;
    }
    usedSnapIds.add(id);
    snapshots.push({
      id,
      docId,
      content: snap.content,
      label: snap.label,
      createdAt: new Date(snap.createdAt),
      wordCount: snap.wordCount,
    });
  }

  if (documents.length === 0 && snapshots.length === 0) {
    return { ok: false, error: 'Backup contained no restorable documents.' };
  }

  await bulkPut(documents, snapshots);

  return {
    ok: true,
    value: {
      documentsImported: documents.length,
      documentsSkipped,
      snapshotsImported: snapshots.length,
      snapshotsSkipped,
      renamedIds,
    },
  };
}

/**
 * Validates, reads, and restores a user-selected backup file.
 * @param file The file chosen from the import picker.
 * @returns A report of what was written, or a rejection reason.
 */
export async function restoreBackupFromFile(file: File): Promise<ValidationResult<RestoreReport>> {
  const fileCheck = validateBackupFile(file);
  if (!fileCheck.ok) return fileCheck;
  return restoreBackupFromText(await file.text());
}
