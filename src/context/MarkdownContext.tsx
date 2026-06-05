import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import {
  markdownReducer,
  initialState,
  type MarkdownState,
  type MarkdownAction,
} from './markdownReducer';

type MarkdownContextType = {
  state: MarkdownState;
  dispatch: React.Dispatch<MarkdownAction>;
};

const MarkdownContext = createContext<MarkdownContextType | undefined>(undefined);

export function MarkdownProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(markdownReducer, initialState);

  return (
    <MarkdownContext.Provider value={{ state, dispatch }}>{children}</MarkdownContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMarkdown() {
  const context = useContext(MarkdownContext);
  if (context === undefined) {
    throw new Error('useMarkdown must be used within a MarkdownProvider');
  }
  return context;
}
