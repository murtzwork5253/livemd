import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getSnapshotsForDoc, deleteSnapshot, type Snapshot } from '../../lib/db';
import { computeDiff } from '../../lib/diff';
import { useMarkdown } from '../../context/MarkdownContext';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal';
import './HistoryPanel.css';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeDocId: string | null;
  onSnapshotRestored: () => void;
}

export function HistoryPanel({
  isOpen,
  onClose,
  activeDocId,
  onSnapshotRestored,
}: HistoryPanelProps) {
  const { state, dispatch } = useMarkdown();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Fetch snapshots when activeDocId changes or the panel opens
  useEffect(() => {
    let active = true;
    if (activeDocId && isOpen) {
      getSnapshotsForDoc(activeDocId).then((snaps) => {
        if (active) {
          snaps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setSnapshots(snaps);
        }
      });
    } else {
      // Defer state update to avoid warnings about synchronous setState in effect callback
      Promise.resolve().then(() => {
        if (active) {
          setSnapshots([]);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [activeDocId, isOpen]);

  const handleRestore = (snapshot: Snapshot) => {
    setConfirmState({
      isOpen: true,
      title: 'Restore Version',
      message:
        'Are you sure you want to restore this version? Your current edits will be saved as a snapshot.',
      confirmLabel: 'Restore',
      variant: 'info',
      onConfirm: () => {
        onSnapshotRestored();
        dispatch({ type: 'SET_MARKDOWN', payload: snapshot.content });
        onClose();
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Stop expansion toggle
    setConfirmState({
      isOpen: true,
      title: 'Delete Snapshot',
      message:
        'Are you sure you want to delete this version history snapshot? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteSnapshot(id);
          setSnapshots((prev) => prev.filter((snap) => snap.id !== id));
          if (expandedId === id) {
            setExpandedId(null);
          }
        } catch (err) {
          console.error('Failed to delete snapshot:', err);
        }
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const formatDocDate = (dateVal: Date | string) => {
    try {
      const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <aside className={`history-panel ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="history-panel-header">
        <h2>Version History</h2>
        <button className="close-history-btn" onClick={onClose} aria-label="Close history panel">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="history-panel-content">
        {snapshots.length === 0 ? (
          <div className="empty-history-state">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="empty-history-icon"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p>No snapshots recorded yet.</p>
            <p className="subtitle">
              Snapshots are saved automatically every 5 minutes during edits, and manually on save
              (Ctrl+S).
            </p>
          </div>
        ) : (
          <ul className="snapshot-list">
            {snapshots.map((snap) => {
              const isExpanded = snap.id === expandedId;
              const formattedDate = formatDocDate(snap.createdAt);

              return (
                <li key={snap.id} className={`snapshot-item ${isExpanded ? 'expanded' : ''}`}>
                  <div
                    className="snapshot-summary"
                    onClick={() => setExpandedId(isExpanded ? null : snap.id)}
                    title={isExpanded ? 'Collapse changes' : 'Expand changes'}
                  >
                    <div className="snapshot-meta">
                      <span className="snapshot-label">{snap.label}</span>
                      <span className="snapshot-time">{formattedDate}</span>
                      <span className="snapshot-wordcount">{snap.wordCount} words</span>
                    </div>
                    <div className="snapshot-actions">
                      <button
                        className="snapshot-action-btn delete"
                        onClick={(e) => handleDelete(e, snap.id)}
                        title="Delete this snapshot"
                        aria-label="Delete snapshot"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="action-icon"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="snapshot-detail">
                      <div className="snapshot-detail-header">
                        <span>Line Diff (Snapshot vs. Editor)</span>
                        <button
                          className="snapshot-restore-btn"
                          onClick={() => handleRestore(snap)}
                        >
                          Restore This Version
                        </button>
                      </div>
                      <div className="diff-container">
                        <pre className="diff-viewer">
                          {computeDiff(snap.content, state.markdown).map((line, index) => (
                            <div key={index} className={`diff-line ${line.type}`}>
                              <span className="diff-indicator">
                                {line.type === 'added'
                                  ? '+'
                                  : line.type === 'removed'
                                    ? '-'
                                    : line.type === 'modified'
                                      ? '✎'
                                      : ' '}
                              </span>
                              <span className="diff-text">
                                {line.type === 'modified' && line.words
                                  ? line.words.map((word, wIdx) => (
                                      <span key={wIdx} className={`diff-word ${word.type}`}>
                                        {word.text}
                                      </span>
                                    ))
                                  : line.text || ' '}
                              </span>
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </aside>
  );
}

export default HistoryPanel;
