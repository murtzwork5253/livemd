import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { exportMarkdown, exportHTML } from '../../lib/export';
import './ExportModal.css';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
}

export function ExportModal({ isOpen, onClose, markdownContent }: ExportModalProps) {
  const [filename, setFilename] = useState('document');
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenPreviewRef = useRef<HTMLDivElement>(null);

  // Focus the filename input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [isExporting, setIsExporting] = useState<'markdown' | 'html' | null>(null);

  if (!isOpen) return null;

  const handleExportMarkdown = () => {
    if (isExporting) return;
    setIsExporting('markdown');
    setTimeout(() => {
      const trimmed = filename.trim() || 'document';
      const finalFilename = trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`;
      exportMarkdown(markdownContent, finalFilename);
      setIsExporting(null);
      onClose();
    }, 1000);
  };

  const handleExportHTML = () => {
    if (isExporting) return;
    setIsExporting('html');
    setTimeout(() => {
      const trimmed = filename.trim() || 'document';
      const finalFilename = trimmed.endsWith('.html') ? trimmed : `${trimmed}.html`;
      const htmlContent = hiddenPreviewRef.current?.innerHTML || '';
      exportHTML(htmlContent, finalFilename);
      setIsExporting(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={isExporting ? undefined : onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">Export Document</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
            disabled={isExporting !== null}
          >
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

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="filename-input">Filename</label>
            <input
              id="filename-input"
              ref={inputRef}
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter file name..."
              disabled={isExporting !== null}
            />
          </div>

          <div className="export-options">
            <button
              className={`export-option-card active ${isExporting !== null ? 'disabled' : ''}`}
              onClick={handleExportMarkdown}
              disabled={isExporting !== null}
            >
              <div className="option-icon">
                {isExporting === 'markdown' ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="spinner-icon"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" stroke="rgba(88, 166, 255, 0.15)" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                )}
              </div>
              <div className="option-details">
                <h3>Export as Markdown</h3>
                <p>
                  {isExporting === 'markdown'
                    ? 'Generating file...'
                    : 'Download the raw markdown source file (.md)'}
                </p>
              </div>
            </button>

            <button
              className={`export-option-card active ${isExporting !== null ? 'disabled' : ''}`}
              onClick={handleExportHTML}
              disabled={isExporting !== null}
            >
              <div className="option-icon">
                {isExporting === 'html' ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="spinner-icon"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" stroke="rgba(88, 166, 255, 0.15)" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="m10 13-2 2 2 2" />
                    <path d="m14 17 2-2-2-2" />
                  </svg>
                )}
              </div>
              <div className="option-details">
                <h3>Export as HTML</h3>
                <p>
                  {isExporting === 'html'
                    ? 'Generating file...'
                    : 'Download the rendered HTML structure (.html)'}
                </p>
              </div>
            </button>

            <button className="export-option-card disabled" title="PDF Export coming soon" disabled>
              <div className="option-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 15h2a2 2 0 0 0 0-4H9v8" />
                  <path d="M13 11v8h2a4 4 0 0 0 0-8h-2z" />
                </svg>
              </div>
              <div className="option-details">
                <h3>Export as PDF</h3>
                <p>Download the print-optimized PDF (.pdf) (Coming Soon)</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div ref={hiddenPreviewRef} className="preview-content" style={{ display: 'none' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  );
}
