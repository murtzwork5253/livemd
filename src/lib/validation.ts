import type { ReadingSettings, Theme, ViewMode } from '../context/markdownReducer';

/**
 * Strict input validation for every piece of external / untrusted data that
 * enters the app (share-link payloads, localStorage, uploaded images, tags).
 *
 * Policy: validate against an explicit schema — type, length, and format — and
 * REJECT anything that does not match. We never silently sanitize or coerce
 * untrusted input into an "acceptable" shape; rejection fails closed.
 */

/** Hard limits applied to untrusted input. */
export const LIMITS = {
  /** Max characters in the encoded `?share=` value before we attempt to decode it. */
  shareEncodedMaxChars: 2_000_000,
  /** Max bytes a shared payload may decompress to (guards gzip decompression bombs). */
  shareDecompressedMaxBytes: 5_000_000,
  /** Max characters for a document's markdown content. */
  contentMaxChars: 5_000_000,
  /** Max characters for a document title. */
  titleMaxChars: 500,
  /** Max characters for a single tag. */
  tagMaxChars: 50,
  /** Max number of tags allowed on a document. */
  tagsMaxCount: 50,
  /** Max bytes for an uploaded / pasted image. */
  imageMaxBytes: 10 * 1024 * 1024,
  /** Max bytes for an imported backup file, checked before it is read or parsed. */
  backupFileMaxBytes: 200 * 1024 * 1024,
  /** Max documents accepted from a single backup file. */
  backupMaxDocuments: 5_000,
  /** Max snapshots accepted from a single backup file. */
  backupMaxSnapshots: 100_000,
  /** Max characters for a snapshot label. */
  snapshotLabelMaxChars: 200,
} as const;

/** Identifiers we generate come from `nanoid`'s default URL-safe alphabet. */
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

/** The envelope written by the backup exporter. */
export const BACKUP_FORMAT = 'livemd-backup';
/** Bundle schema version. Bump when the record shape changes. */
export const BACKUP_VERSION = 1;

/** A document as it appears inside a backup file (dates are ISO strings). */
export interface BackupDocument {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

/** A snapshot as it appears inside a backup file (dates are ISO strings). */
export interface BackupSnapshot {
  id: string;
  docId: string;
  content: string;
  label: string;
  createdAt: string;
  wordCount: number;
}

const THEMES: readonly Theme[] = ['light', 'dark'];
const VIEW_MODES: readonly ViewMode[] = ['editor', 'split', 'preview'];
const FONT_FAMILIES: readonly ReadingSettings['fontFamily'][] = ['serif', 'sans', 'mono'];

/** Only base64 characters (standard alphabet, optional `=` padding). */
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;
/** Tags: lowercase letters, digits, and single internal hyphens only. */
const TAG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Discriminated result: either a validated value or a human-readable rejection reason. */
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

function isFiniteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

/**
 * Validates a decoded share payload against the strict schema
 * `{ content: string; title: string; v?: number }`. Rejects on any type or
 * length violation rather than trimming the payload down.
 */
export function validateSharePayload(
  parsed: unknown,
): ValidationResult<{ content: string; title: string }> {
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'payload is not an object' };
  }
  const { content, title } = parsed as Record<string, unknown>;

  if (typeof content !== 'string') return { ok: false, error: 'content is not a string' };
  if (typeof title !== 'string') return { ok: false, error: 'title is not a string' };
  if (content.length > LIMITS.contentMaxChars) return { ok: false, error: 'content too long' };
  if (title.length > LIMITS.titleMaxChars) return { ok: false, error: 'title too long' };

  return { ok: true, value: { content, title } };
}

/**
 * Validates the raw encoded `?share=` string: enforces a length ceiling and the
 * base64 character set (after stripping an optional `v2:` prefix) before any
 * `atob`/decompression runs. Returns the payload bytes' base64 body on success.
 */
export function validateEncodedShare(
  encoded: string,
): ValidationResult<{ body: string; compressed: boolean }> {
  if (typeof encoded !== 'string' || encoded.length === 0) {
    return { ok: false, error: 'empty share value' };
  }
  if (encoded.length > LIMITS.shareEncodedMaxChars) {
    return { ok: false, error: 'share value exceeds maximum length' };
  }
  const compressed = encoded.startsWith('v2:');
  const body = compressed ? encoded.slice(3) : encoded;
  if (!BASE64_RE.test(body)) {
    return { ok: false, error: 'share value is not valid base64' };
  }
  return { ok: true, value: { body, compressed } };
}

/** Validates a persisted theme string, returning the fallback on any mismatch. */
export function validateTheme(value: unknown, fallback: Theme): Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
    ? (value as Theme)
    : fallback;
}

/** Validates a persisted view-mode string, returning the fallback on any mismatch. */
export function validateViewMode(value: unknown, fallback: ViewMode): ViewMode {
  return typeof value === 'string' && (VIEW_MODES as readonly string[]).includes(value)
    ? (value as ViewMode)
    : fallback;
}

/**
 * Validates persisted reading settings against a strict schema (each field
 * typed and range-checked). Any malformed field rejects the whole object and
 * the provided fallback is used instead.
 */
export function validateReadingSettings(
  value: unknown,
  fallback: ReadingSettings,
): ReadingSettings {
  if (typeof value !== 'object' || value === null) return fallback;
  const { fontSize, lineWidth, fontFamily, lineHeight } = value as Record<string, unknown>;

  if (!isFiniteInRange(fontSize, 10, 40)) return fallback;
  if (!isFiniteInRange(lineWidth, 320, 1600)) return fallback;
  if (!isFiniteInRange(lineHeight, 1, 3)) return fallback;
  if (
    typeof fontFamily !== 'string' ||
    !(FONT_FAMILIES as readonly string[]).includes(fontFamily)
  ) {
    return fallback;
  }

  return {
    fontSize,
    lineWidth,
    lineHeight,
    fontFamily: fontFamily as ReadingSettings['fontFamily'],
  };
}

/**
 * Validates a single tag against the strict schema (lowercase alphanumeric with
 * single internal hyphens, length-bounded). Rejects rather than sanitizing —
 * callers should normalize casing/`#` before validating.
 */
export function validateTag(tag: string): ValidationResult<string> {
  if (typeof tag !== 'string') return { ok: false, error: 'tag is not a string' };
  if (tag.length === 0) return { ok: false, error: 'tag is empty' };
  if (tag.length > LIMITS.tagMaxChars) return { ok: false, error: 'tag too long' };
  if (!TAG_RE.test(tag)) return { ok: false, error: 'tag has invalid characters' };
  return { ok: true, value: tag };
}

/**
 * Validates an uploaded / pasted image file against the strict schema: MIME
 * type must be `image/*` and size must be within `imageMaxBytes`. Rejects
 * everything else instead of attempting to embed it.
 */
export function validateImageFile(file: File): ValidationResult<File> {
  if (!(file instanceof File)) return { ok: false, error: 'Not a valid file.' };
  if (!/^image\/[a-z0-9.+-]+$/i.test(file.type)) {
    return { ok: false, error: 'Only image files can be added.' };
  }
  if (file.size <= 0) return { ok: false, error: 'That image appears to be empty.' };
  if (file.size > LIMITS.imageMaxBytes) {
    const maxMb = Math.round(LIMITS.imageMaxBytes / (1024 * 1024));
    return { ok: false, error: `Image is too large (max ${maxMb} MB).` };
  }
  return { ok: true, value: file };
}

/** Accepts only a parseable, finite ISO-8601-ish date string. */
function isDateString(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 40 && !Number.isNaN(Date.parse(value));
}

/**
 * Validates the outer envelope of an imported backup file: format marker,
 * schema version, and the two record arrays (including their length ceilings).
 * The records themselves are left untouched — validate each one with
 * {@link validateBackupDocument} / {@link validateBackupSnapshot}.
 */
export function validateBackupEnvelope(
  parsed: unknown,
): ValidationResult<{ documents: unknown[]; snapshots: unknown[] }> {
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'Backup file is not a JSON object.' };
  }
  const { format, version, documents, snapshots } = parsed as Record<string, unknown>;

  if (format !== BACKUP_FORMAT) {
    return { ok: false, error: 'This file is not a LiveMD backup.' };
  }
  if (version !== BACKUP_VERSION) {
    return { ok: false, error: `Unsupported backup version (expected ${BACKUP_VERSION}).` };
  }
  if (!Array.isArray(documents)) {
    return { ok: false, error: 'Backup is missing its documents list.' };
  }
  if (!Array.isArray(snapshots)) {
    return { ok: false, error: 'Backup is missing its snapshots list.' };
  }
  if (documents.length > LIMITS.backupMaxDocuments) {
    return { ok: false, error: 'Backup contains too many documents.' };
  }
  if (snapshots.length > LIMITS.backupMaxSnapshots) {
    return { ok: false, error: 'Backup contains too many snapshots.' };
  }

  return { ok: true, value: { documents, snapshots } };
}

/**
 * Validates a single document record from a backup file against the strict
 * schema. A record that does not match is rejected outright — the importer
 * counts it as skipped rather than repairing it into something storable.
 *
 * Note on tags: format (lowercase/hyphen) is enforced at the entry boundary by
 * {@link validateTag}, not here. Local libraries created before that rule
 * existed may hold tags in other casings, and a restore must not silently drop
 * a user's own documents over it — so here we only bound type, length, and count.
 */
export function validateBackupDocument(value: unknown): ValidationResult<BackupDocument> {
  if (typeof value !== 'object' || value === null) {
    return { ok: false, error: 'document is not an object' };
  }
  const { id, title, content, tags, createdAt, updatedAt } = value as Record<string, unknown>;

  if (typeof id !== 'string' || !ID_RE.test(id)) return { ok: false, error: 'invalid document id' };
  if (typeof title !== 'string') return { ok: false, error: 'title is not a string' };
  if (typeof content !== 'string') return { ok: false, error: 'content is not a string' };
  if (title.length > LIMITS.titleMaxChars) return { ok: false, error: 'title too long' };
  if (content.length > LIMITS.contentMaxChars) return { ok: false, error: 'content too long' };
  if (!isDateString(createdAt)) return { ok: false, error: 'invalid createdAt' };
  if (!isDateString(updatedAt)) return { ok: false, error: 'invalid updatedAt' };

  let safeTags: string[] | undefined;
  if (tags !== undefined) {
    if (!Array.isArray(tags)) return { ok: false, error: 'tags is not an array' };
    if (tags.length > LIMITS.tagsMaxCount) return { ok: false, error: 'too many tags' };
    if (!tags.every((t) => typeof t === 'string' && t.length > 0 && t.length <= LIMITS.tagMaxChars))
      return { ok: false, error: 'invalid tag entry' };
    safeTags = tags as string[];
  }

  return {
    ok: true,
    value: { id, title, content, createdAt, updatedAt, ...(safeTags ? { tags: safeTags } : {}) },
  };
}

/**
 * Validates a single snapshot record from a backup file against the strict
 * schema. Rejected records are reported as skipped by the importer.
 */
export function validateBackupSnapshot(value: unknown): ValidationResult<BackupSnapshot> {
  if (typeof value !== 'object' || value === null) {
    return { ok: false, error: 'snapshot is not an object' };
  }
  const { id, docId, content, label, createdAt, wordCount } = value as Record<string, unknown>;

  if (typeof id !== 'string' || !ID_RE.test(id)) return { ok: false, error: 'invalid snapshot id' };
  if (typeof docId !== 'string' || !ID_RE.test(docId)) return { ok: false, error: 'invalid docId' };
  if (typeof content !== 'string') return { ok: false, error: 'content is not a string' };
  if (content.length > LIMITS.contentMaxChars) return { ok: false, error: 'content too long' };
  if (typeof label !== 'string' || label.length > LIMITS.snapshotLabelMaxChars) {
    return { ok: false, error: 'invalid label' };
  }
  if (!isDateString(createdAt)) return { ok: false, error: 'invalid createdAt' };
  if (!isFiniteInRange(wordCount, 0, Number.MAX_SAFE_INTEGER)) {
    return { ok: false, error: 'invalid wordCount' };
  }

  return { ok: true, value: { id, docId, content, label, createdAt, wordCount } };
}

/**
 * Reads a decompression stream while enforcing a byte ceiling, aborting as soon
 * as the cumulative output exceeds `maxBytes`. Guards against gzip bombs where a
 * tiny compressed payload would otherwise inflate without bound.
 */
export async function readStreamCapped(
  stream: ReadableStream<Uint8Array>,
  maxBytes: number,
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > maxBytes) {
          throw new Error('decompressed payload exceeds maximum size');
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}
