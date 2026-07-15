import { useState, useRef, useEffect } from 'react';
import type { ReadingSettings } from '../../context/markdownReducer';
import './TypographyPanel.css';

interface TypographyPanelProps {
  settings: ReadingSettings;
  onChange: (newSettings: Partial<ReadingSettings>) => void;
}

export function TypographyPanel({ settings, onChange }: TypographyPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="typography-panel-container" ref={panelRef}>
      {isOpen && (
        <div className="typography-panel" role="dialog" aria-label="Typography settings">
          <div className="typography-section">
            <span className="section-title">Font Family</span>
            <div className="font-selector">
              {(['serif', 'sans', 'mono'] as const).map((font) => (
                <button
                  key={font}
                  className={`font-btn ${settings.fontFamily === font ? 'active' : ''}`}
                  onClick={() => onChange({ fontFamily: font })}
                >
                  {font === 'serif' ? 'Serif' : font === 'sans' ? 'Sans' : 'Mono'}
                </button>
              ))}
            </div>
          </div>

          <div className="typography-section">
            <div className="section-header">
              <span className="section-title">Font Size</span>
              <span className="section-value">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min="14"
              max="22"
              step="1"
              value={settings.fontSize}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
              className="typography-slider"
              aria-label="Font size in pixels"
            />
          </div>

          <div className="typography-section">
            <div className="section-header">
              <span className="section-title">Line Height</span>
              <span className="section-value">{settings.lineHeight}</span>
            </div>
            <input
              type="range"
              min="1.4"
              max="2.2"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
              className="typography-slider"
              aria-label="Line height spacing factor"
            />
          </div>

          <div className="typography-section">
            <div className="section-header">
              <span className="section-title">Column Width</span>
              <span className="section-value">{settings.lineWidth}px</span>
            </div>
            <input
              type="range"
              min="480"
              max="900"
              step="20"
              value={settings.lineWidth}
              onChange={(e) => onChange({ lineWidth: Number(e.target.value) })}
              className="typography-slider"
              aria-label="Text column max width in pixels"
            />
          </div>
        </div>
      )}

      <button
        className={`typography-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Typography settings"
        aria-expanded={isOpen}
        aria-label="Toggle typography settings menu"
      >
        <span className="trigger-text">
          A<span>A</span>
        </span>
      </button>
    </div>
  );
}
export default TypographyPanel;
