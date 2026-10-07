import { useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useDocuments } from '../../hooks/useDocuments';
import { useStorageStatus } from '../../hooks/useStorageStatus';
import { downloadBackup, restoreBackupFromFile } from '../../lib/backup';
import { formatBytes, STORAGE_WARNING_PERCENT } from '../../lib/storage';
import './DataBackup.css';

/**
 * Settings section covering data durability: whether the browser has agreed to
 * keep this library, how much storage it occupies, and full backup export /
 * import.
 */
export function DataBackup() {
  const { persistence, usage, isRequesting, refresh, enablePersistence } = useStorageStatus();
  const { loadAllDocs } = useDocuments();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBusy, setIsBusy] = useState(false);

  const percent = usage ? Math.min(100, Math.round(usage.percentUsed * 10) / 10) : 0;
  const isNearFull = percent >= STORAGE_WARNING_PERCENT;

  const handleEnablePersistence = async () => {
    const state = await enablePersistence();
    if (state === 'persisted') {
      showToast('Your documents are now protected from automatic cleanup.', 'info');
    } else {
      showToast('Your browser declined persistent storage. Keep a backup instead.', 'warning');
    }
  };

  const handleExport = async () => {
    setIsBusy(true);
    try {
      const filename = await downloadBackup();
      showToast(`Backup saved as ${filename}.`, 'info');
    } catch (err) {
      console.error('Failed to export backup:', err);
      showToast('Could not create the backup file.', 'error');
    } finally {
      setIsBusy(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsBusy(true);
    try {
      const result = await restoreBackupFromFile(file);
      if (!result.ok) {
        showToast(result.error, 'error');
        return;
      }
      const { documentsImported, documentsSkipped, snapshotsImported } = result.value;
      await loadAllDocs();
      await refresh();
      const skipped = documentsSkipped > 0 ? ` ${documentsSkipped} skipped.` : '';
      showToast(
        `Restored ${documentsImported} document${documentsImported === 1 ? '' : 's'} and ${snapshotsImported} snapshot${snapshotsImported === 1 ? '' : 's'}.${skipped}`,
        'info',
      );
    } catch (err) {
      console.error('Failed to restore backup:', err);
      showToast('Could not read that backup file.', 'error');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="settings-section">
      <h3>Data &amp; Backup</h3>

      <div className={`storage-status ${persistence === 'persisted' ? 'protected' : ''}`}>
        <div className="storage-status-text">
          <span className="storage-status-label">
            {persistence === 'persisted'
              ? 'Protected from automatic cleanup'
              : persistence === 'not-persisted'
                ? 'At risk of automatic cleanup'
                : 'Storage protection unavailable'}
          </span>
          <span className="storage-status-hint">
            {persistence === 'persisted'
              ? 'Your browser will keep these documents until you delete them.'
              : 'Browsers may clear site data when disk space runs low. Keep a backup.'}
          </span>
        </div>
        {persistence === 'not-persisted' && (
          <button
            className="storage-action-btn primary"
            onClick={handleEnablePersistence}
            disabled={isRequesting}
          >
            {isRequesting ? 'Requesting…' : 'Protect'}
          </button>
        )}
      </div>

      {usage && usage.quota > 0 && (
        <div className="storage-usage">
          <div className="storage-usage-bar">
            <div
              className={`storage-usage-fill ${isNearFull ? 'warning' : ''}`}
              style={{ width: `${Math.max(percent, 0.5)}%` }}
            />
          </div>
          <span className="storage-usage-text">
            Using {formatBytes(usage.usage)} of {formatBytes(usage.quota)} ({percent}%)
          </span>
        </div>
      )}

      <div className="backup-actions">
        <button className="storage-action-btn" onClick={handleExport} disabled={isBusy}>
          Download backup
        </button>
        <button
          className="storage-action-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
        >
          Import backup…
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="backup-file-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            // Reset so re-picking the same file fires a fresh change event.
            e.target.value = '';
            if (file) handleImport(file);
          }}
        />
      </div>
      <p className="backup-note">
        A backup holds every document and its version history. Importing adds to your library — it
        never overwrites what is already here.
      </p>
    </section>
  );
}
