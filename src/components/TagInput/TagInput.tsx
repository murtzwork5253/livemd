import React, { useState } from 'react';
import { LIMITS, validateTag } from '../../lib/validation';
import './TagInput.css';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const addTag = (val: string) => {
    // Normalize casing/`#` first, then validate against the strict tag schema.
    const normalized = val.trim().toLowerCase().replace(/^#/, '');
    if (!normalized) {
      setInput('');
      return;
    }
    if (tags.length >= LIMITS.tagsMaxCount) {
      setError(`Maximum ${LIMITS.tagsMaxCount} tags`);
      return;
    }
    const result = validateTag(normalized);
    if (!result.ok) {
      setError('Tags must be lowercase letters, numbers, and hyphens');
      return;
    }
    if (!tags.includes(result.value)) {
      onChange([...tags, result.value]);
    }
    setInput('');
    setError('');
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
        maxLength={LIMITS.tagMaxChars}
        onChange={(e) => {
          setInput(e.target.value);
          if (error) setError('');
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (input.trim()) {
            addTag(input);
          }
        }}
        placeholder={tags.length === 0 ? 'Add tags (press Enter or comma)...' : 'Add tag...'}
        aria-label="Add tag input"
        aria-invalid={error ? true : undefined}
      />
      {error && (
        <span className="tag-input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default TagInput;
