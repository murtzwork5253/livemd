import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Document } from '../../context/markdownReducer';

interface DocumentListProps {
  documents: Document[];
  activeDocId: string | null;
  onOpen: (id: string) => Promise<void>;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DocumentList({
  documents,
  activeDocId,
  onOpen,
  onRename,
  onDelete,
}: DocumentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleDoubleClick = (doc: Document) => {
    setEditingId(doc.id);
    setEditTitle(doc.title);
    setDeletingId(null); // Close any open delete prompts
  };

  const handleRenameSubmit = async (id: string) => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== documents.find((d) => d.id === id)?.title) {
      await onRename(id, trimmed);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const formatDocDate = (dateVal: Date | string) => {
    try {
      const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (documents.length === 0) {
    return (
      <div className="empty-docs-state">
        <p>No documents found</p>
      </div>
    );
  }

  return (
    <ul className="document-list">
      {documents.map((doc) => {
        const isActive = doc.id === activeDocId;
        const isEditing = doc.id === editingId;
        const isDeleting = doc.id === deletingId;

        return (
          <li
            key={doc.id}
            className={`document-item ${isActive ? 'active' : ''} ${
              isEditing ? 'editing' : ''
            } ${isDeleting ? 'deleting-confirm' : ''}`}
            onClick={() => {
              if (!isEditing && !isDeleting) {
                onOpen(doc.id);
              }
            }}
          >
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => handleRenameSubmit(doc.id)}
                onKeyDown={(e) => handleKeyDown(e, doc.id)}
                className="rename-input"
                aria-label="Rename document"
              />
            ) : isDeleting ? (
              <div className="delete-confirm-wrapper" onClick={(e) => e.stopPropagation()}>
                <span className="delete-confirm-text">Delete?</span>
                <div className="delete-confirm-actions">
                  <button
                    className="delete-confirm-btn yes"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onDelete(doc.id);
                      setDeletingId(null);
                    }}
                    aria-label="Confirm delete"
                  >
                    Yes
                  </button>
                  <button
                    className="delete-confirm-btn no"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(null);
                    }}
                    aria-label="Cancel delete"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="doc-item-main" onDoubleClick={() => handleDoubleClick(doc)}>
                  <span className="doc-title" title="Double-click to rename">
                    {doc.title}
                  </span>
                  <span className="doc-date">{formatDocDate(doc.updatedAt)}</span>
                </div>
                <button
                  className="doc-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(doc.id);
                  }}
                  title="Delete Document"
                  aria-label={`Delete ${doc.title}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="delete-icon"
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
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
export default DocumentList;
