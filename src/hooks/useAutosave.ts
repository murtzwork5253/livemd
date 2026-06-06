import { useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { useMarkdown } from '../context/MarkdownContext';
import { saveDocument, getDocument, getAllDocuments } from '../lib/db';

export function useAutosave(delay: number = 1000) {
  const { state, dispatch } = useMarkdown();
  const { markdown, activeDocId } = state;
  const debouncedValue = useDebounce(markdown, delay);
  const lastSavedContentRef = useRef<Record<string, string>>({});
  const activeDocIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeDocId) {
      if (activeDocId !== activeDocIdRef.current) {
        activeDocIdRef.current = activeDocId;
        lastSavedContentRef.current[activeDocId] = markdown;
      }
    } else {
      activeDocIdRef.current = null;
    }
  }, [activeDocId, markdown]);

  useEffect(() => {
    const docId = activeDocId;
    if (!docId) return;
    const finalDocId: string = docId;

    const lastSaved = lastSavedContentRef.current[finalDocId];
    if (debouncedValue === lastSaved) return;

    let isMounted = true;

    async function autoSave() {
      try {
        const doc = await getDocument(finalDocId);
        if (doc && isMounted) {
          const updatedDoc = {
            ...doc,
            content: debouncedValue,
            updatedAt: new Date(),
          };
          await saveDocument(updatedDoc);

          if (isMounted) {
            lastSavedContentRef.current[finalDocId] = debouncedValue;
            dispatch({ type: 'SET_LAST_SAVED', payload: updatedDoc.updatedAt });

            const docs = await getAllDocuments();
            if (isMounted) {
              docs.sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
              );
              dispatch({ type: 'SET_DOCUMENTS', payload: docs });
            }
          }
        }
      } catch (err) {
        console.error('Failed to autosave document:', err);
      }
    }

    autoSave();

    return () => {
      isMounted = false;
    };
  }, [debouncedValue, activeDocId, dispatch]);
}
