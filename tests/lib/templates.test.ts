import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '../../src/lib/templates';

describe('Document Templates database', () => {
  it('should contain exactly 6 templates', () => {
    expect(TEMPLATES.length).toBe(6);
  });

  it('should have correct structure for each template', () => {
    TEMPLATES.forEach((tpl) => {
      expect(tpl.id).toBeDefined();
      expect(tpl.label).toBeDefined();
      expect(tpl.description).toBeDefined();
      expect(tpl.icon).toBeDefined();
      expect(tpl.getTitle).toBeTypeOf('function');
      expect(tpl.getContent).toBeTypeOf('function');
    });
  });

  it('should inject correct dynamic dates into meeting-notes title and content', () => {
    const meetingNotes = TEMPLATES.find((t) => t.id === 'meeting-notes');
    expect(meetingNotes).toBeDefined();

    if (meetingNotes) {
      const todayStr = new Date().toLocaleDateString('en-GB');
      expect(meetingNotes.getTitle()).toBe(`Meeting notes — ${todayStr}`);
      expect(meetingNotes.getContent()).toContain('Meeting Notes');
      expect(meetingNotes.getContent()).toContain(todayStr);
      expect(meetingNotes.getContent()).toContain('Attendees:');
      expect(meetingNotes.getContent()).toContain('Action Items');
    }
  });

  it('should inject correct dynamic dates into daily-journal title and content', () => {
    const journal = TEMPLATES.find((t) => t.id === 'daily-journal');
    expect(journal).toBeDefined();

    if (journal) {
      const longDateStr = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      expect(journal.getTitle()).toBe(longDateStr);
      expect(journal.getContent()).toContain(`# ${longDateStr}`);
      expect(journal.getContent()).toContain('Mindset');
      expect(journal.getContent()).toContain('Tomorrow\'s Priority');
    }
  });

  it('should format README template standard structure', () => {
    const readme = TEMPLATES.find((t) => t.id === 'readme');
    expect(readme).toBeDefined();

    if (readme) {
      expect(readme.getTitle()).toBe('README');
      expect(readme.getContent()).toContain('LiveMD');
      expect(readme.getContent()).toContain('npm install');
    }
  });
});
