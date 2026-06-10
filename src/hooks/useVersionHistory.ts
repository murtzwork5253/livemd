import { useEffect, useRef, useCallback } from 'react';
import { saveSnapshot, pruneSnapshots, type Snapshot } from '../lib/db';
import { nanoid } from 'nanoid';
import { useMarkdown } from '../context/MarkdownContext';

const SNAPSHOT_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useVersionHistory() {
  const { state } = useMarkdown();
  const { activeDocId, markdown } = state;
  
  // Cache the last snapshot content per document ID to avoid duplicate writes
  const lastSnapshotContentRef = useRef<Record<string, string>>({});

  const createSnapshot = useCallback(async (label: string = 'Auto-save') => {
    if (!activeDocId || !markdown.trim()) return;

    // Check if content has changed since the last snapshot of this document
    const lastContent = lastSnapshotContentRef.current[activeDocId];
    if (markdown === lastContent) return;

    const wordCount = markdown.split(/\s+/).filter(Boolean).length;
    const newSnapshot: Snapshot = {
      id: nanoid(),
      docId: activeDocId,
      content: markdown,
      label,
      createdAt: new Date(),
      wordCount,
    };

    try {
      await saveSnapshot(newSnapshot);
      await pruneSnapshots(activeDocId, 50);
      lastSnapshotContentRef.current[activeDocId] = markdown;
    } catch (err) {
      console.error('Failed to save snapshot:', err);
    }
  }, [activeDocId, markdown]);

  // Cache the initial content when document loads so auto-save snapshot is not triggered immediately
  useEffect(() => {
    if (activeDocId && lastSnapshotContentRef.current[activeDocId] === undefined) {
      lastSnapshotContentRef.current[activeDocId] = markdown;
    }
  }, [activeDocId, markdown]);

  // Periodic auto-snapshots
  useEffect(() => {
    if (!activeDocId) return;

    const intervalId = setInterval(() => {
      createSnapshot('Auto-save');
    }, SNAPSHOT_INTERVAL);

    return () => clearInterval(intervalId);
  }, [activeDocId, createSnapshot]);

  return { createSnapshot };
}
export default useVersionHistory;
