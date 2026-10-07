import { useCallback, useEffect, useState } from 'react';
import {
  getPersistenceState,
  getStorageUsage,
  requestPersistence,
  type PersistenceState,
  type StorageUsage,
} from '../lib/storage';

/** Reads both storage facts in parallel. Neither call prompts the user. */
async function readStatus(): Promise<[PersistenceState, StorageUsage | null]> {
  return Promise.all([getPersistenceState(), getStorageUsage()]);
}

/**
 * Tracks whether the browser has promised to keep this origin's data (rather
 * than treating it as evictable cache) and how much of the quota is in use.
 *
 * Reading the state never prompts; only `enablePersistence` does, so it must be
 * wired to an explicit user action.
 */
export function useStorageStatus() {
  const [persistence, setPersistence] = useState<PersistenceState>('unsupported');
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const refresh = useCallback(async () => {
    const [state, estimate] = await readStatus();
    setPersistence(state);
    setUsage(estimate);
  }, []);

  useEffect(() => {
    let active = true;
    readStatus().then(([state, estimate]) => {
      // The panel can close before the estimate resolves.
      if (!active) return;
      setPersistence(state);
      setUsage(estimate);
    });
    return () => {
      active = false;
    };
  }, []);

  /** Asks the browser for persistent storage. Some browsers show a prompt. */
  const enablePersistence = useCallback(async (): Promise<PersistenceState> => {
    setIsRequesting(true);
    try {
      const state = await requestPersistence();
      setPersistence(state);
      return state;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  return { persistence, usage, isRequesting, refresh, enablePersistence };
}
