import { useState, useEffect, useRef } from 'react';
import { buildShareURL } from '../../lib/shareLink';
import './ShareModal.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
  documentTitle: string;
}

export function ShareModal({ isOpen, onClose, markdownContent, documentTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  const [sizeKB, setSizeKB] = useState(0);
  const [tooLarge, setTooLarge] = useState(false);
  const [isShortening, setIsShortening] = useState(false);
  const [shortenError, setShortenError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = url === '';

  useEffect(() => {
    if (isOpen) {
      buildShareURL(markdownContent, documentTitle)
        .then((generatedUrl) => {
          setUrl(generatedUrl);
          const sizeBytes = new TextEncoder().encode(generatedUrl).length;
          const calculatedSizeKB = Number((sizeBytes / 1024).toFixed(1));
          setSizeKB(calculatedSizeKB);
          setTooLarge(calculatedSizeKB > 8.0);
        })
        .catch((err) => {
          console.error('Failed to generate share URL:', err);
        });
    }

    return () => {
      setUrl('');
      setTooLarge(false);
      setIsShortening(false);
      setShortenError('');
    };
  }, [isOpen, markdownContent, documentTitle]);

  // Auto-focus input when open
  useEffect(() => {
    if (isOpen && !tooLarge && !isLoading) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, tooLarge, isLoading]);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleShorten = async () => {
    if (!url || url.startsWith('https://is.gd')) return;
    setIsShortening(true);
    setShortenError('');
    try {
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(
          `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`
        )}`
      );
      if (!response.ok) throw new Error('Shortening service is temporarily unavailable.');
      
      const data = await response.json();
      if (!data.contents) {
        throw new Error('Shortening service returned empty contents.');
      }

      let result;
      try {
        result = JSON.parse(data.contents);
      } catch {
        throw new Error('Shortening service response was invalid.');
      }

      if (result.shorturl) {
        setUrl(result.shorturl);
        // Also update size to reflect shortened URL
        const sizeBytes = new TextEncoder().encode(result.shorturl).length;
        setSizeKB(Number((sizeBytes / 1024).toFixed(1)));
      } else if (result.errormessage) {
        throw new Error(result.errormessage);
      } else {
        throw new Error('Could not shorten URL. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Failed to shorten URL:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to shorten URL.';
      setShortenError(errorMessage);
    } finally {
      setIsShortening(false);
    }
  };

  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        <div className="modal-header">
          <h2 id="share-modal-title">Share Document</h2>
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
          {isLoading ? (
            <p className="share-instruction">Generating share link...</p>
          ) : tooLarge ? (
            <div className="share-warning">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="warning-icon"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h3>Document is too large</h3>
              <p>
                This document is {sizeKB}KB, which exceeds the maximum recommended share link size of 8.0KB.
              </p>
              <p className="secondary-warning">
                Please reduce the document content size, or use the <strong>Export</strong> feature in the top toolbar to download it as a file.
              </p>
            </div>
          ) : (
            <div className="share-success-content">
              <p className="share-instruction">
                Copy the link below. Anyone with this link can view a read-only preview of this document.
              </p>
              <div className="share-input-wrapper">
                <input
                  ref={inputRef}
                  id="share-url-input"
                  type="text"
                  readOnly
                  value={url}
                  className="share-url-input"
                  aria-label="Shareable document URL"
                />
                <button
                  className={`share-copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                  aria-label="Copy share link"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {shortenError && (
                <p className="share-error-text" style={{ color: 'var(--accent-orange)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '0.75rem', fontFamily: 'var(--font-sans)' }}>
                  ⚠️ {shortenError}
                </p>
              )}

              {!url.startsWith('https://is.gd') && (
                <button
                  className="share-shorten-btn"
                  onClick={handleShorten}
                  disabled={isShortening || isLocalhost}
                  title={isLocalhost ? "Public shorteners cannot redirect to localhost" : "⚡ Generate Short URL"}
                >
                  {isShortening ? 'Shortening link...' : isLocalhost ? '⚡ Shortening requires public domain' : '⚡ Generate Short URL'}
                </button>
              )}

              {isLocalhost && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1.25rem', textAlign: 'center', fontFamily: 'var(--font-sans)', lineHeight: '1.4' }}>
                  ℹ️ Public URL shorteners cannot redirect to local environments (`localhost`). URL shortening will be fully active once this app is deployed to a public domain.
                </p>
              )}

              <div className="share-status-info">
                <span>Link Size: {sizeKB}KB / 8.0KB</span>
                <span className="secure-badge">✓ Zero Server Data Storage</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
