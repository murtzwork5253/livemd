import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportMarkdown, exportHTML, exportPDF } from '../../src/lib/export';

import html2pdf from 'html2pdf.js';

vi.mock('html2pdf.js', () => {
  const saveMock = vi.fn().mockResolvedValue(undefined);
  const setMock = vi.fn();
  const fromMock = vi.fn();

  const instance = {
    from: fromMock,
    set: setMock,
    save: saveMock,
  };

  fromMock.mockReturnValue(instance);
  setMock.mockReturnValue(instance);

  const html2pdfMock = vi.fn().mockReturnValue(instance);

  return {
    default: html2pdfMock,
  };
});

describe('exportMarkdown', () => {
  beforeEach(() => {
    const mockElement = {
      href: '',
      download: '',
      click: vi.fn(),
    };

    const mockDocument = {
      createElement: vi.fn().mockReturnValue(mockElement),
    };

    const mockURL = {
      createObjectURL: vi.fn().mockReturnValue('blob:http://localhost/mock-uuid'),
      revokeObjectURL: vi.fn(),
    };

    Object.defineProperty(globalThis, 'document', {
      value: mockDocument,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(globalThis, 'URL', {
      value: mockURL,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).document;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).URL;
  });

  it('should create a blob, assign URL, trigger download, and revoke URL', () => {
    const content = '# Hello World';
    const filename = 'test-doc.md';

    exportMarkdown(content, filename);

    // Verify document.createElement was called with 'a'
    expect(document.createElement).toHaveBeenCalledWith('a');

    // Verify URL.createObjectURL was called with a Blob
    expect(URL.createObjectURL).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blobArg = (URL.createObjectURL as any).mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);

    // Verify anchor properties and click action
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdElement = (document.createElement as any).mock.results[0].value;
    expect(createdElement.href).toBe('blob:http://localhost/mock-uuid');
    expect(createdElement.download).toBe(filename);
    expect(createdElement.click).toHaveBeenCalled();

    // Verify URL.revokeObjectURL was called to clean up
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-uuid');
  });

  it('should use default filename when none is provided', () => {
    const content = '# Hello World';
    exportMarkdown(content);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdElement = (document.createElement as any).mock.results[0].value;
    expect(createdElement.download).toBe('document.md');
  });
});

describe('exportHTML', () => {
  beforeEach(() => {
    const mockElement = {
      href: '',
      download: '',
      click: vi.fn(),
    };

    const mockDocument = {
      createElement: vi.fn().mockReturnValue(mockElement),
    };

    const mockURL = {
      createObjectURL: vi.fn().mockReturnValue('blob:http://localhost/mock-uuid'),
      revokeObjectURL: vi.fn(),
    };

    Object.defineProperty(globalThis, 'document', {
      value: mockDocument,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(globalThis, 'URL', {
      value: mockURL,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).document;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).URL;
  });

  it('should create an HTML blob wrapped in template structure, trigger download, and revoke URL', async () => {
    const htmlContent = '<h1>Test Heading</h1><p>Test paragraph</p>';
    const filename = 'my-export.html';

    exportHTML(htmlContent, filename);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(URL.createObjectURL).toHaveBeenCalled();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blobArg = (URL.createObjectURL as any).mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);

    // Verify blob contents include the HTML markup and skeleton doc elements
    const blobText = await blobArg.text();
    expect(blobText).toContain('<!DOCTYPE html>');
    expect(blobText).toContain('<h1>Test Heading</h1><p>Test paragraph</p>');
    expect(blobText).toContain('max-width: 800px');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdElement = (document.createElement as any).mock.results[0].value;
    expect(createdElement.href).toBe('blob:http://localhost/mock-uuid');
    expect(createdElement.download).toBe(filename);
    expect(createdElement.click).toHaveBeenCalled();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-uuid');
  });

  it('should use default filename document.html when none is specified', () => {
    const htmlContent = '<p>plain text</p>';
    exportHTML(htmlContent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdElement = (document.createElement as any).mock.results[0].value;
    expect(createdElement.download).toBe('document.html');
  });
});

describe('exportPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call html2pdf with the correct element, options, and trigger save', async () => {
    const mockElement = {} as HTMLElement;
    const filename = 'my-custom-doc.pdf';

    await exportPDF(mockElement, filename);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2pdfMock = html2pdf as any;
    expect(html2pdfMock).toHaveBeenCalled();

    const instance = html2pdfMock.mock.results[0].value;
    expect(instance.from).toHaveBeenCalledWith(mockElement);
    expect(instance.set).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: filename,
        jsPDF: expect.objectContaining({
          format: 'letter',
          orientation: 'portrait',
        }),
      })
    );
    expect(instance.save).toHaveBeenCalled();
  });

  it('should use default filename document.pdf when none is specified', async () => {
    const mockElement = {} as HTMLElement;

    await exportPDF(mockElement);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2pdfMock = html2pdf as any;
    const instance = html2pdfMock.mock.results[0].value;
    expect(instance.set).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'document.pdf',
      })
    );
  });
});
