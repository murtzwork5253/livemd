import React, { useState } from 'react';
import './TagInput.css';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = (val: string) => {
    const cleanTag = val.trim().toLowerCase().replace(/^#/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      onChange([...tags, cleanTag]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      // Remove last tag if backspace is pressed on empty input
      e.preventDefault();
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="tag-input-container">
      {tags.map((tag) => (
        <span key={tag} className="tag-pill">
          #{tag}
          <button
            type="button"
            className="tag-remove-btn"
            onClick={() => removeTag(tag)}
            aria-label={`Remove tag ${tag}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        type="text"
        className="tag-input-field"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (input.trim()) {
            addTag(input);
          }
        }}
        placeholder={tags.length === 0 ? 'Add tags (press Enter or comma)...' : 'Add tag...'}
        aria-label="Add tag input"
      />
    </div>
  );
}

export default TagInput;
