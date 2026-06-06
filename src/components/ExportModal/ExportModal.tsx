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

  if (!isOpen) return null;

  const handleExportMarkdown = () => {
    const trimmed = filename.trim() || 'document';
    const finalFilename = trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`;
    exportMarkdown(markdownContent, finalFilename);
    onClose();
  };

  const handleExportHTML = () => {
    const trimmed = filename.trim() || 'document';
    const finalFilename = trimmed.endsWith('.html') ? trimmed : `${trimmed}.html`;
    const htmlContent = hiddenPreviewRef.current?.innerHTML || '';
    exportHTML(htmlContent, finalFilename);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">Export Document</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
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
            />
          </div>

          <div className="export-options">
            <button className="export-option-card active" onClick={handleExportMarkdown}>
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
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="option-details">
                <h3>Export as Markdown</h3>
                <p>Download the raw markdown source file (.md)</p>
              </div>
            </button>

            <button className="export-option-card active" onClick={handleExportHTML}>
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
                  <path d="m10 13-2 2 2 2" />
                  <path d="m14 17 2-2-2-2" />
                </svg>
              </div>
              <div className="option-details">
                <h3>Export as HTML</h3>
                <p>Download the rendered HTML structure (.html)</p>
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

      <div ref={hiddenPreviewRef} style={{ display: 'none' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  );
}
