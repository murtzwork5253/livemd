import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { extractHeadings } from '../../lib/markdownHelpers';
import './TableOfContents.css';

interface TableOfContentsProps {
  markdown: string;
}

export const TableOfContents = memo(function TableOfContents({ markdown }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const headings = useMemo(() => extractHeadings(markdown), [markdown]);

  // Close the TOC panel if the user clicks outside it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHeadingClick = (id: string) => {
    //('TableOfContents handleHeadingClick called with id:', id);
    const container = document.getElementById('preview-pane-container');
    let element = document.getElementById(id);
    //('TableOfContents container:', !!container, 'initial element by ID:', !!element);

    if (!element && container) {
      const normalizedTarget = id.toLowerCase().replace(/[^a-z0-9]/g, '');
      //('Fuzzy matching. Normalized target ID:', normalizedTarget);
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (const heading of Array.from(headings)) {
        const headingId = heading.getAttribute('id') || '';
        const normalizedHeading = headingId.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normalizedHeading === normalizedTarget) {
          element = heading as HTMLElement;
          break;
        }
      }
      //('Fuzzy matched element found:', !!element);
    }

    if (container && element) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollOffset = elementRect.top - containerRect.top + container.scrollTop - 16;
      //('Scrolling container to offset:', scrollOffset);

      container.scrollTo({
        top: scrollOffset,
        behavior: 'smooth',
      });

      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    } else if (element) {
      //('Container not found, scrolling element directly');
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    } else {
      console.warn('Target heading element not found for id:', id);
    }
  };

  return (
    <div className="toc-wrapper">
      <button
        ref={buttonRef}
        className={`toc-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Table of Contents"
        aria-label="Table of Contents"
        aria-expanded={isOpen}
      >
        <svg
          viewBox="0 0 24 24"
          className="toc-icon"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      {isOpen && (
        <div ref={panelRef} className="toc-panel">
          <div className="toc-header">
            <h3>Table of Contents</h3>
            <button
              className="toc-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Table of Contents"
            >
              <svg
                viewBox="0 0 24 24"
                className="close-icon"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <div className="toc-body">
            {headings.length === 0 ? (
              <p className="no-headings">No headings found</p>
            ) : (
              <ul className="toc-list">
                {headings.map((heading, index) => (
                  <li
                    key={`${heading.id}-${index}`}
                    className={`toc-item level-${heading.level}`}
                    onClick={() => handleHeadingClick(heading.id)}
                    style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                  >
                    <span className="toc-text">{heading.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
export default TableOfContents;
