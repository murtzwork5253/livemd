import { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { DocumentList } from './DocumentList';
import './Sidebar.css';

export function Sidebar() {
  const { documents, createDoc, openDoc, renameDoc, deleteDoc, activeDocId } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateNew = async () => {
    await createDoc('Untitled Document');
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="new-doc-btn" onClick={handleCreateNew} aria-label="Create new document">
          <svg
            viewBox="0 0 24 24"
            className="btn-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          New Document
        </button>
      </div>

      <div className="sidebar-search">
        <div className="search-wrapper">
          <svg
            viewBox="0 0 24 24"
            className="search-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search documents by title"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
            >
              <svg
                viewBox="0 0 24 24"
                className="clear-icon"
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
          )}
        </div>
      </div>

      <div className="sidebar-content">
        <DocumentList
          documents={filteredDocs}
          activeDocId={activeDocId}
          onOpen={openDoc}
          onRename={renameDoc}
          onDelete={deleteDoc}
        />
      </div>
    </aside>
  );
}
export default Sidebar;
