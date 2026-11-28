import { TEMPLATES } from '../../lib/templates';
import type { Template } from '../../lib/templates';
import { AnimatedModal } from '../Motion/AnimatedModal';
import './TemplateModal.css';

interface TemplateModalProps {
  isOpen?: boolean;
  onSelect: (template: Template) => void;
  onStartBlank: () => void;
  onClose: () => void;
}

export function TemplateModal({
  isOpen = true,
  onSelect,
  onStartBlank,
  onClose,
}: TemplateModalProps) {
  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="template-modal-title"
      overlayClassName="template-modal-overlay"
      contentClassName="template-modal"
    >
        <header className="template-modal-header">
          <h2 id="template-modal-title">Choose a template</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close template selector">
            ✕
          </button>
        </header>
        <div className="template-modal-content">
          <p className="template-modal-subtitle">
            Pre-fill your editor with a well-structured document template, or start fresh.
          </p>
          <div className="template-modal-grid">
            <button className="template-card blank-card" onClick={onStartBlank}>
              <span className="template-card-icon">📄</span>
              <div className="template-card-info">
                <span className="template-card-label">Blank Document</span>
                <span className="template-card-desc">Create a clean, empty document</span>
              </div>
            </button>

            {TEMPLATES.map((tpl) => (
              <button key={tpl.id} className="template-card" onClick={() => onSelect(tpl)}>
                <span className="template-card-icon">{tpl.icon}</span>
                <div className="template-card-info">
                  <span className="template-card-label">{tpl.label}</span>
                  <span className="template-card-desc">{tpl.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <footer className="template-modal-footer">
          <button className="template-modal-skip-btn" onClick={onStartBlank}>
            Start Blank
          </button>
        </footer>
    </AnimatedModal>
  );
}
export default TemplateModal;
