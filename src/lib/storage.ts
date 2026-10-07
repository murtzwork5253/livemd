/**
 * Browser storage durability helpers.
 *
 * Everything LiveMD saves lives in IndexedDB, which browsers classify as
 * "best-effort" by default — under storage pressure the whole origin can be
 * evicted without warning, taking every document with it. Asking for the
 * `persistent` bucket moves the origin out of that eviction pool, so data is
 * only removed when the user removes it.
 */

/** Whether the origin's storage is exempt from automatic eviction. */
export type PersistenceState = 'persisted' | 'not-persisted' | 'unsupported';

/** Usage figures reported by the Storage Manager API. */
export interface StorageUsage {
  /** Bytes currently used by this origin. */
  usage: number;
  /** Bytes this origin is allowed to use. */
  quota: number;
  /** `usage / quota` as a percentage, 0 when the quota is unknown. */
  percentUsed: number;
}

/** localStorage key marking that we already asked the browser to persist. */
const PERSIST_REQUESTED_KEY = 'livemd-persist-requested';

function storageManager(): StorageManager | null {
  if (typeof navigator === 'undefined') return null;
  return navigator.storage ?? null;
}

/**
 * Reads the current persistence state without prompting the user.
 * @returns The persistence state, or `'unsupported'` where the API is missing.
 */
export async function getPersistenceState(): Promise<PersistenceState> {
  const manager = storageManager();
  if (!manager?.persisted) return 'unsupported';
  try {
    return (await manager.persisted()) ? 'persisted' : 'not-persisted';
  } catch {
    return 'unsupported';
  }
}

/**
 * Asks the browser to make this origin's storage persistent.
 *
 * Chromium grants this silently based on engagement heuristics; Firefox shows a
 * permission prompt, so only call this in response to a deliberate user action.
 * @returns The resulting persistence state.
 */
export async function requestPersistence(): Promise<PersistenceState> {
  const manager = storageManager();
  if (!manager?.persist) return 'unsupported';
  try {
    const granted = await manager.persist();
    markPersistenceRequested();
    return granted ? 'persisted' : 'not-persisted';
  } catch {
    return 'unsupported';
  }
}

/** Records that the automatic persistence request has already been made. */
function markPersistenceRequested(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(PERSIST_REQUESTED_KEY, '1');
  } catch {
    // Storage may be unavailable (private mode); retrying next time is harmless.
  }
}

/**
 * Requests persistence at most once per browser profile, and only when it is
 * not already granted. Call this after a meaningful user action (creating a
 * document) so any browser prompt arrives with obvious context rather than on
 * a cold page load.
 * @returns The resulting persistence state.
 */
export async function ensurePersistenceRequested(): Promise<PersistenceState> {
  const current = await getPersistenceState();
  if (current !== 'not-persisted') return current;

  const alreadyAsked =
    typeof localStorage !== 'undefined' && localStorage.getItem(PERSIST_REQUESTED_KEY) === '1';
  if (alreadyAsked) return current;

  return requestPersistence();
}

/**
 * Estimates how much of the origin's storage quota is in use.
 * @returns Usage figures, or `null` when the browser cannot report them.
 */
export async function getStorageUsage(): Promise<StorageUsage | null> {
  const manager = storageManager();
  if (!manager?.estimate) return null;
  try {
    const { usage = 0, quota = 0 } = await manager.estimate();
    return { usage, quota, percentUsed: quota > 0 ? (usage / quota) * 100 : 0 };
  } catch {
    return null;
  }
}

/** Percentage of quota at which we warn the user that storage is filling up. */
export const STORAGE_WARNING_PERCENT = 80;

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/**
 * Formats a byte count into a short human-readable string (e.g. `4.2 MB`).
 * @param bytes The number of bytes.
 * @returns The formatted size, or `'—'` for negative/non-finite input.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${Math.round(bytes)} B`;

  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${UNITS[unit]}`;
}
