export type Document = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface Snapshot {
  id: string;
  docId: string;
  content: string;
  label: string; // "Auto-save" or "Manual save"
  createdAt: Date | string;
  wordCount: number;
}

export type ViewMode = 'editor' | 'split' | 'preview';
export type Theme = 'light' | 'dark';

export type MarkdownState = {
  markdown: string;
  theme: Theme;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  activeDocId: string | null;
  documents: Document[];
  snapshots: Snapshot[];
  lastSaved: Date | null;
  isLoading: boolean;
  isSharedView: boolean;
};

export type MarkdownAction =
  | { type: 'SET_MARKDOWN'; payload: string }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ACTIVE_DOC'; payload: { id: string | null; content: string } }
  | { type: 'SET_LAST_SAVED'; payload: Date | null }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'SET_SNAPSHOTS'; payload: Snapshot[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SHARED_VIEW'; payload: boolean };

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const initialState: MarkdownState = {
  markdown: isBrowser
    ? localStorage.getItem('livemd-markdown') || '# Welcome to LiveMD\n\nStart writing...'
    : '# Welcome to LiveMD\n\nStart writing...',
  theme: isBrowser ? (localStorage.getItem('livemd-theme') as Theme) || 'dark' : 'dark',
  viewMode: isBrowser ? (localStorage.getItem('livemd-viewmode') as ViewMode) || 'split' : 'split',
  sidebarOpen: true,
  activeDocId: null,
  documents: [],
  snapshots: [],
  lastSaved: null,
  isLoading: true,
  isSharedView: false,
};

export function markdownReducer(state: MarkdownState, action: MarkdownAction): MarkdownState {
  switch (action.type) {
    case 'SET_MARKDOWN':
      return { ...state, markdown: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_ACTIVE_DOC':
      return { ...state, activeDocId: action.payload.id, markdown: action.payload.content };
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    case 'SET_SNAPSHOTS':
      return { ...state, snapshots: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SHARED_VIEW':
      return { ...state, isSharedView: action.payload };
    default:
      return state;
  }
}
