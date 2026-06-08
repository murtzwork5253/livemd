import { useMarkdown } from '../context/MarkdownContext';
import { saveDocument, getAllDocuments, deleteDocument, getDocument } from '../lib/db';
import { nanoid } from 'nanoid';
import type { Document } from '../context/markdownReducer';

export function useDocuments() {
  const { state, dispatch } = useMarkdown();

  /**
   * Loads all saved documents from IndexedDB.
   * If the database is empty, seeds it with a default welcome document.
   */
  const loadAllDocs = async (): Promise<Document[]> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // await new Promise((resolve) => setTimeout(resolve, 10000));
    try {
      const docs = await getAllDocuments();
      if (docs.length === 0) {
        const defaultDoc: Document = {
          id: nanoid(),
          title: 'Welcome to LiveMD',
          content: '# Welcome to LiveMD\n\nStart writing...',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await saveDocument(defaultDoc);
        dispatch({ type: 'SET_DOCUMENTS', payload: [defaultDoc] });
        dispatch({
          type: 'SET_ACTIVE_DOC',
          payload: { id: defaultDoc.id, content: defaultDoc.content },
        });
        localStorage.setItem('livemd-active-doc-id', defaultDoc.id);
        return [defaultDoc];
      } else {
        // Sort documents by updatedAt descending
        docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        dispatch({ type: 'SET_DOCUMENTS', payload: docs });

        // Load the last active document from localStorage or fallback to the most recent one
        const lastActiveId = localStorage.getItem('livemd-active-doc-id');
        const docToLoad = docs.find((d) => d.id === lastActiveId) || docs[0];

        dispatch({
          type: 'SET_ACTIVE_DOC',
          payload: { id: docToLoad.id, content: docToLoad.content },
        });
        localStorage.setItem('livemd-active-doc-id', docToLoad.id);
        return docs;
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Creates a new blank document, saves it in IndexedDB, and opens it.
   */
  const createDoc = async (title: string = 'Untitled Document'): Promise<Document> => {
    const newDoc: Document = {
      id: nanoid(),
      title,
      content: `# ${title}\n\nStart writing...`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      await saveDocument(newDoc);
      const docs = await getAllDocuments();
      docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      dispatch({ type: 'SET_DOCUMENTS', payload: docs });
      dispatch({ type: 'SET_ACTIVE_DOC', payload: { id: newDoc.id, content: newDoc.content } });
      localStorage.setItem('livemd-active-doc-id', newDoc.id);

      // Auto-collapse sidebar on mobile screen size
      if (window.innerWidth < 768 && state.sidebarOpen) {
        dispatch({ type: 'TOGGLE_SIDEBAR' });
      }
    } catch (err) {
      console.error('Failed to create document:', err);
    }
    return newDoc;
  };

  /**
   * Opens an existing document.
   */
  const openDoc = async (id: string): Promise<void> => {
    try {
      const doc = await getDocument(id);
      if (doc) {
        dispatch({ type: 'SET_ACTIVE_DOC', payload: { id: doc.id, content: doc.content } });
        localStorage.setItem('livemd-active-doc-id', doc.id);

        // Auto-collapse sidebar on mobile screen size
        if (window.innerWidth < 768 && state.sidebarOpen) {
          dispatch({ type: 'TOGGLE_SIDEBAR' });
        }
      }
    } catch (err) {
      console.error('Failed to open document:', err);
    }
  };

  /**
   * Renames a document by its ID.
   */
  const renameDoc = async (id: string, newTitle: string): Promise<void> => {
    try {
      const doc = await getDocument(id);
      if (doc) {
        const updated = {
          ...doc,
          title: newTitle.trim() || 'Untitled Document',
          updatedAt: new Date(),
        };
        await saveDocument(updated);
        const docs = await getAllDocuments();
        docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        dispatch({ type: 'SET_DOCUMENTS', payload: docs });
      }
    } catch (err) {
      console.error('Failed to rename document:', err);
    }
  };

  /**
   * Deletes a document by its ID.
   */
  const deleteDoc = async (id: string): Promise<void> => {
    try {
      await deleteDocument(id);
      const docs = await getAllDocuments();
      docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      dispatch({ type: 'SET_DOCUMENTS', payload: docs });

      if (state.activeDocId === id) {
        if (docs.length > 0) {
          const nextDoc = docs[0];
          dispatch({
            type: 'SET_ACTIVE_DOC',
            payload: { id: nextDoc.id, content: nextDoc.content },
          });
          localStorage.setItem('livemd-active-doc-id', nextDoc.id);
        } else {
          dispatch({
            type: 'SET_ACTIVE_DOC',
            payload: { id: null, content: '' },
          });
          localStorage.removeItem('livemd-active-doc-id');
        }
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  return {
    documents: state.documents,
    activeDocId: state.activeDocId,
    isLoading: state.isLoading,
    loadAllDocs,
    createDoc,
    openDoc,
    renameDoc,
    deleteDoc,
  };
}
