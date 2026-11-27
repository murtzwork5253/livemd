import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TemplateModal } from '../../src/components/TemplateModal/TemplateModal';
import { TEMPLATES } from '../../src/lib/templates';

describe('TemplateModal', () => {
  it('renders dialog semantics, blank option, and all starter templates', () => {
    const html = renderToStaticMarkup(
      <TemplateModal onSelect={vi.fn()} onStartBlank={vi.fn()} onClose={vi.fn()} />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('Choose a template');
    expect(html).toContain('Blank Document');

    for (const template of TEMPLATES) {
      expect(html).toContain(template.label);
    }
  });
});
