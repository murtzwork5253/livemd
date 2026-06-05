import { useEffect, useState } from 'react';
import { useMarkdown } from '../../context/MarkdownContext';
import { useWordCount } from '../../hooks/useWordCount';
import { differenceInSeconds } from 'date-fns';
import './StatusBar.css';

interface StatusBarProps {
  cursor: { line: number; col: number };
}

export function StatusBar({ cursor }: StatusBarProps) {
  const { state } = useMarkdown();
  const { wordCount, charCount, readTime } = useWordCount(state.markdown);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!state.lastSaved) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [state.lastSaved]);

  let timeAgo = 'Not saved yet';
  if (state.lastSaved) {
    const diff = differenceInSeconds(new Date(), state.lastSaved);
    if (diff < 5) {
      timeAgo = 'Saved just now';
    } else if (diff < 60) {
      timeAgo = `Saved ${diff}s ago`;
    } else {
      const minutes = Math.floor(diff / 60);
      timeAgo = `Saved ${minutes}m${minutes > 1 ? 's' : ''} ago`;
    }
  }

  return (
    <div className="editor-statusbar">
      <div className="statusbar-left">
        <span className="statusbar-item">
          Ln {cursor.line}, Col {cursor.col}
        </span>
        <span className="statusbar-separator">|</span>
        <span className="statusbar-item">{wordCount} words</span>
        <span className="statusbar-separator">|</span>
        <span className="statusbar-item">{charCount} chars</span>
        <span className="statusbar-separator">|</span>
        <span className="statusbar-item">{readTime} min read</span>
      </div>
      <div className="statusbar-right">
        <span className="statusbar-item statusbar-save-status">{timeAgo}</span>
      </div>
    </div>
  );
}
