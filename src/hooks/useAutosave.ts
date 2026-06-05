import { useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { useMarkdown } from '../context/MarkdownContext';

export function useAutosave(key: string, value: string, delay: number = 1000) {
  const debouncedValue = useDebounce(value, delay);
  const { dispatch } = useMarkdown();

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, debouncedValue);
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
    }
  }, [key, debouncedValue, dispatch]);
}
