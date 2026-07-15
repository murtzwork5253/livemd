import { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { useMarkdown } from '../../context/MarkdownContext';
import { DocumentList } from './DocumentList';
import { TemplateModal } from '../TemplateModal/TemplateModal';
import { searchDocuments } from '../../lib/search';
import type { Template } from '../../lib/templates';
import './Sidebar.css';

export function Sidebar() {
  const { documents, createDoc, openDoc, renameDoc, deleteDoc, activeDocId, isLoading } =
    useDocuments();
  const { state, dispatch } = useMarkdown();
  const { searchQuery, activeTagFilter } = state;
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const handleCreateNew = () => {
    setIsTemplateModalOpen(true);
  };

  const handleSelectTemplate = async (template: Template) => {
    await createDoc(template.getTitle(), template.getContent());
    setIsTemplateModalOpen(false);
  };

  const handleStartBlank = async () => {
    await createDoc('Untitled Document');
    setIsTemplateModalOpen(false);
  };

  const searchedDocs = searchDocuments(documents, searchQuery);
  const filteredDocs = searchedDocs.filter((doc) => {
    return activeTagFilter ? (doc.tags || []).includes(activeTagFilter) : true;
  });

  const allTags = Array.from(new Set(documents.flatMap((doc) => doc.tags || []))).sort();

  return (
    <aside className="sidebar">
      {isTemplateModalOpen && (
        <TemplateModal
          onSelect={handleSelectTemplate}
          onStartBlank={handleStartBlank}
          onClose={() => setIsTemplateModalOpen(false)}
        />
      )}
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
            onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
            className="search-input"
            aria-label="Search documents by title and content"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
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
        {isLoading ? (
          <div className="sidebar-skeleton-list" aria-busy="true" aria-live="polite">
            <div className="sidebar-skeleton-item pulsing" />
            <div className="sidebar-skeleton-item pulsing" />
            <div className="sidebar-skeleton-item pulsing" />
          </div>
        ) : (
          <DocumentList
            documents={filteredDocs}
            activeDocId={activeDocId}
            searchQuery={searchQuery}
            onOpen={openDoc}
            onRename={renameDoc}
            onDelete={deleteDoc}
          />
        )}
      </div>

      {allTags.length > 0 && (
        <div className="sidebar-tags-section">
          <h3>Tags</h3>
          <div className="sidebar-tags-list">
            <button
              className={`tag-filter-btn ${activeTagFilter === null ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAG_FILTER', payload: null })}
              aria-label="Show all documents"
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`tag-filter-btn ${activeTagFilter === tag ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAG_FILTER', payload: tag })}
                aria-label={`Filter by tag ${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
export default Sidebar;
