import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ensurePersistenceRequested,
  formatBytes,
  getPersistenceState,
  getStorageUsage,
  requestPersistence,
} from '../../src/lib/storage';

/** Installs a fake `navigator.storage` for the duration of a test. */
function mockStorageManager(manager: Partial<StorageManager> | null) {
  Object.defineProperty(globalThis.navigator, 'storage', {
    value: manager,
    configurable: true,
    writable: true,
  });
}

/** Minimal in-memory `localStorage` — these tests run in the node environment. */
function installLocalStorage() {
  const entries = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => void entries.set(key, value),
      removeItem: (key: string) => void entries.delete(key),
      clear: () => entries.clear(),
    },
    configurable: true,
    writable: true,
  });
}

describe('formatBytes', () => {
  it('scales through units', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe('2.0 GB');
  });

  it('drops the decimal for large values in a unit', () => {
    expect(formatBytes(50 * 1024 * 1024)).toBe('50 MB');
  });

  it('returns a placeholder for invalid input', () => {
    expect(formatBytes(-1)).toBe('—');
    expect(formatBytes(Number.NaN)).toBe('—');
  });
});

describe('persistence state', () => {
  beforeEach(() => {
    installLocalStorage();
  });

  afterEach(() => {
    mockStorageManager(null);
  });

  it('reports unsupported when the API is missing', async () => {
    mockStorageManager(null);
    expect(await getPersistenceState()).toBe('unsupported');
    expect(await requestPersistence()).toBe('unsupported');
  });

  it('reports persisted / not-persisted from the API', async () => {
    mockStorageManager({ persisted: vi.fn().mockResolvedValue(true) });
    expect(await getPersistenceState()).toBe('persisted');

    mockStorageManager({ persisted: vi.fn().mockResolvedValue(false) });
    expect(await getPersistenceState()).toBe('not-persisted');
  });

  it('treats a throwing API as unsupported', async () => {
    mockStorageManager({ persisted: vi.fn().mockRejectedValue(new Error('nope')) });
    expect(await getPersistenceState()).toBe('unsupported');
  });

  it('does not re-request once already persisted', async () => {
    const persist = vi.fn().mockResolvedValue(true);
    mockStorageManager({ persisted: vi.fn().mockResolvedValue(true), persist });

    expect(await ensurePersistenceRequested()).toBe('persisted');
    expect(persist).not.toHaveBeenCalled();
  });

  it('requests persistence only once per profile', async () => {
    const persist = vi.fn().mockResolvedValue(false);
    mockStorageManager({ persisted: vi.fn().mockResolvedValue(false), persist });

    expect(await ensurePersistenceRequested()).toBe('not-persisted');
    expect(persist).toHaveBeenCalledTimes(1);

    // A denied request is remembered, so the user is not prompted again.
    expect(await ensurePersistenceRequested()).toBe('not-persisted');
    expect(persist).toHaveBeenCalledTimes(1);
  });
});

describe('getStorageUsage', () => {
  afterEach(() => {
    mockStorageManager(null);
  });

  it('returns null when estimates are unavailable', async () => {
    mockStorageManager(null);
    expect(await getStorageUsage()).toBeNull();
  });

  it('computes the used percentage', async () => {
    mockStorageManager({
      estimate: vi.fn().mockResolvedValue({ usage: 250, quota: 1000 }),
    });
    expect(await getStorageUsage()).toEqual({ usage: 250, quota: 1000, percentUsed: 25 });
  });

  it('avoids dividing by an unknown quota', async () => {
    mockStorageManager({ estimate: vi.fn().mockResolvedValue({ usage: 10, quota: 0 }) });
    expect(await getStorageUsage()).toEqual({ usage: 10, quota: 0, percentUsed: 0 });
  });
});
