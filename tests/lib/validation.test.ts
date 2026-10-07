import { describe, it, expect } from 'vitest';
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  LIMITS,
  readStreamCapped,
  validateBackupDocument,
  validateBackupEnvelope,
  validateBackupSnapshot,
  validateEncodedShare,
  validateImageFile,
  validateReadingSettings,
  validateSharePayload,
  validateTag,
  validateTheme,
  validateViewMode,
} from '../../src/lib/validation';
import type { ReadingSettings } from '../../src/context/markdownReducer';

const DEFAULTS: ReadingSettings = {
  fontSize: 17,
  lineWidth: 680,
  fontFamily: 'serif',
  lineHeight: 1.8,
};

describe('validateSharePayload', () => {
  it('accepts a well-formed payload', () => {
    const result = validateSharePayload({ content: 'hi', title: 'Doc', v: 2 });
    expect(result).toEqual({ ok: true, value: { content: 'hi', title: 'Doc' } });
  });

  it('rejects non-object and missing/mistyped fields', () => {
    expect(validateSharePayload(null).ok).toBe(false);
    expect(validateSharePayload('nope').ok).toBe(false);
    expect(validateSharePayload({ content: 1, title: 'x' }).ok).toBe(false);
    expect(validateSharePayload({ content: 'x' }).ok).toBe(false);
  });

  it('rejects over-length content and title', () => {
    expect(
      validateSharePayload({ content: 'a'.repeat(LIMITS.contentMaxChars + 1), title: '' }).ok,
    ).toBe(false);
    expect(
      validateSharePayload({ content: '', title: 'a'.repeat(LIMITS.titleMaxChars + 1) }).ok,
    ).toBe(false);
  });
});

describe('validateEncodedShare', () => {
  it('accepts a v2-prefixed base64 body and strips the prefix', () => {
    const result = validateEncodedShare('v2:aGVsbG8=');
    expect(result).toEqual({ ok: true, value: { body: 'aGVsbG8=', compressed: true } });
  });

  it('accepts legacy (unprefixed) base64', () => {
    const result = validateEncodedShare('aGVsbG8=');
    expect(result).toEqual({ ok: true, value: { body: 'aGVsbG8=', compressed: false } });
  });

  it('rejects empty, over-length, and non-base64 input', () => {
    expect(validateEncodedShare('').ok).toBe(false);
    expect(validateEncodedShare('a'.repeat(LIMITS.shareEncodedMaxChars + 1)).ok).toBe(false);
    expect(validateEncodedShare('v2:not valid base64!!').ok).toBe(false);
  });
});

describe('validateTheme / validateViewMode', () => {
  it('passes through valid enum values', () => {
    expect(validateTheme('light', 'dark')).toBe('light');
    expect(validateViewMode('preview', 'split')).toBe('preview');
  });

  it('falls back on invalid values', () => {
    expect(validateTheme('neon', 'dark')).toBe('dark');
    expect(validateTheme(null, 'dark')).toBe('dark');
    expect(validateViewMode('zoom', 'split')).toBe('split');
  });
});

describe('validateReadingSettings', () => {
  it('accepts a valid settings object', () => {
    const value = { fontSize: 20, lineWidth: 700, fontFamily: 'sans', lineHeight: 2 };
    expect(validateReadingSettings(value, DEFAULTS)).toEqual(value);
  });

  it('rejects out-of-range, NaN, and unknown-font values', () => {
    expect(validateReadingSettings({ ...DEFAULTS, fontSize: 999 }, DEFAULTS)).toEqual(DEFAULTS);
    expect(validateReadingSettings({ ...DEFAULTS, fontSize: NaN }, DEFAULTS)).toEqual(DEFAULTS);
    expect(validateReadingSettings({ ...DEFAULTS, fontFamily: 'comic' }, DEFAULTS)).toEqual(
      DEFAULTS,
    );
    expect(validateReadingSettings('garbage', DEFAULTS)).toEqual(DEFAULTS);
  });
});

describe('validateTag', () => {
  it('accepts lowercase alphanumeric with internal hyphens', () => {
    expect(validateTag('react-19').ok).toBe(true);
  });

  it('rejects empty, over-length, and bad-format tags', () => {
    expect(validateTag('').ok).toBe(false);
    expect(validateTag('a'.repeat(LIMITS.tagMaxChars + 1)).ok).toBe(false);
    expect(validateTag('Has Spaces').ok).toBe(false);
    expect(validateTag('-leading').ok).toBe(false);
    expect(validateTag('emoji🚀').ok).toBe(false);
  });
});

describe('validateImageFile', () => {
  it('accepts an image within the size limit', () => {
    const file = new File([new Uint8Array(10)], 'a.png', { type: 'image/png' });
    expect(validateImageFile(file).ok).toBe(true);
  });

  it('rejects non-image types, empty files, and oversized files', () => {
    expect(validateImageFile(new File(['x'], 'a.txt', { type: 'text/plain' })).ok).toBe(false);
    expect(validateImageFile(new File([], 'a.png', { type: 'image/png' })).ok).toBe(false);
    const big = new File([new Uint8Array(1)], 'big.png', { type: 'image/png' });
    Object.defineProperty(big, 'size', { value: LIMITS.imageMaxBytes + 1 });
    expect(validateImageFile(big).ok).toBe(false);
  });
});

describe('validateBackupEnvelope', () => {
  const envelope = { format: BACKUP_FORMAT, version: BACKUP_VERSION, documents: [], snapshots: [] };

  it('accepts a well-formed envelope', () => {
    expect(validateBackupEnvelope(envelope)).toEqual({
      ok: true,
      value: { documents: [], snapshots: [] },
    });
  });

  it('rejects foreign files and unknown versions', () => {
    expect(validateBackupEnvelope(null).ok).toBe(false);
    expect(validateBackupEnvelope({ ...envelope, format: 'something-else' }).ok).toBe(false);
    expect(validateBackupEnvelope({ ...envelope, version: BACKUP_VERSION + 1 }).ok).toBe(false);
  });

  it('rejects missing or non-array record lists', () => {
    expect(validateBackupEnvelope({ ...envelope, documents: undefined }).ok).toBe(false);
    expect(validateBackupEnvelope({ ...envelope, snapshots: 'nope' }).ok).toBe(false);
  });

  it('rejects record counts above the ceiling', () => {
    expect(
      validateBackupEnvelope({
        ...envelope,
        documents: new Array(LIMITS.backupMaxDocuments + 1).fill({}),
      }).ok,
    ).toBe(false);
    expect(
      validateBackupEnvelope({
        ...envelope,
        snapshots: new Array(LIMITS.backupMaxSnapshots + 1).fill({}),
      }).ok,
    ).toBe(false);
  });
});

describe('validateBackupDocument', () => {
  const doc = {
    id: 'abc_XYZ-123',
    title: 'Doc',
    content: '# Doc',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-02T00:00:00.000Z',
  };

  it('accepts a well-formed document, with or without tags', () => {
    expect(validateBackupDocument(doc)).toEqual({ ok: true, value: doc });
    expect(validateBackupDocument({ ...doc, tags: ['notes', 'ideas'] }).ok).toBe(true);
  });

  it('rejects ids outside the nanoid alphabet', () => {
    expect(validateBackupDocument({ ...doc, id: 'has space' }).ok).toBe(false);
    expect(validateBackupDocument({ ...doc, id: '../../etc' }).ok).toBe(false);
    expect(validateBackupDocument({ ...doc, id: '' }).ok).toBe(false);
    expect(validateBackupDocument({ ...doc, id: 'a'.repeat(65) }).ok).toBe(false);
  });

  it('rejects mistyped and unparseable fields', () => {
    expect(validateBackupDocument('nope').ok).toBe(false);
    expect(validateBackupDocument({ ...doc, title: 42 }).ok).toBe(false);
    expect(validateBackupDocument({ ...doc, content: null }).ok).toBe(false);
    expect(validateBackupDocument({ ...doc, createdAt: 'not-a-date' }).ok).toBe(false);
    expect(validateBackupDocument({ ...doc, updatedAt: undefined }).ok).toBe(false);
  });

  it('rejects over-long content and titles', () => {
    expect(validateBackupDocument({ ...doc, title: 'a'.repeat(LIMITS.titleMaxChars + 1) }).ok).toBe(
      false,
    );
    expect(
      validateBackupDocument({ ...doc, content: 'a'.repeat(LIMITS.contentMaxChars + 1) }).ok,
    ).toBe(false);
  });

  it('rejects malformed tag collections', () => {
    expect(validateBackupDocument({ ...doc, tags: 'notes' }).ok).toBe(false);
    expect(validateBackupDocument({ ...doc, tags: [1, 2] }).ok).toBe(false);
    expect(validateBackupDocument({ ...doc, tags: [''] }).ok).toBe(false);
    expect(
      validateBackupDocument({ ...doc, tags: new Array(LIMITS.tagsMaxCount + 1).fill('t') }).ok,
    ).toBe(false);
  });
});

describe('validateBackupSnapshot', () => {
  const snap = {
    id: 'snap1',
    docId: 'abc_XYZ-123',
    content: '# Doc',
    label: 'Auto-save',
    createdAt: '2026-05-01T00:00:00.000Z',
    wordCount: 2,
  };

  it('accepts a well-formed snapshot', () => {
    expect(validateBackupSnapshot(snap)).toEqual({ ok: true, value: snap });
  });

  it('rejects bad references, labels, and word counts', () => {
    expect(validateBackupSnapshot({ ...snap, docId: 'bad id' }).ok).toBe(false);
    expect(
      validateBackupSnapshot({ ...snap, label: 'a'.repeat(LIMITS.snapshotLabelMaxChars + 1) }).ok,
    ).toBe(false);
    expect(validateBackupSnapshot({ ...snap, wordCount: -1 }).ok).toBe(false);
    expect(validateBackupSnapshot({ ...snap, wordCount: Number.NaN }).ok).toBe(false);
    expect(validateBackupSnapshot({ ...snap, wordCount: '2' }).ok).toBe(false);
  });
});

describe('readStreamCapped', () => {
  function streamOf(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
    return new ReadableStream({
      start(controller) {
        for (const c of chunks) controller.enqueue(c);
        controller.close();
      },
    });
  }

  it('concatenates chunks when under the cap', async () => {
    const out = await readStreamCapped(streamOf([new Uint8Array([1, 2]), new Uint8Array([3])]), 10);
    expect(Array.from(out)).toEqual([1, 2, 3]);
  });

  it('throws once the cumulative size exceeds the cap (zip-bomb guard)', async () => {
    const chunks = [new Uint8Array(4), new Uint8Array(4)];
    await expect(readStreamCapped(streamOf(chunks), 5)).rejects.toThrow(/maximum size/);
  });
});
