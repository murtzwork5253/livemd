import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportMarkdown,
  exportHTML,
  exportPDFViaPrint,
  sanitizeExportFilename,
} from '../../src/lib/export';

describe('sanitizeExportFilename', () => {
  it('keeps a normal name unchanged', () => {
    expect(sanitizeExportFilename('my-report_v2')).toBe('my-report_v2');
  });

  it('strips filesystem-illegal characters', () => {
    expect(sanitizeExportFilename('a/b\\c:d*e?f"g<h>i|j')).toBe('abcdefghij');
  });

  it('strips C0 control characters', () => {
    expect(sanitizeExportFilename(`a${String.fromCharCode(0)}b${String.fromCharCode(31)}c`)).toBe(
      'abc',
    );
  });

  it('collapses whitespace and trims', () => {
    expect(sanitizeExportFilename('  hello   world  ')).toBe('hello world');
  });

  it('caps length at 200 characters', () => {
    expect(sanitizeExportFilename('x'.repeat(500))).toHaveLength(200);
  });

  it('falls back to "document" when nothing usable remains', () => {
    expect(sanitizeExportFilename('   ')).toBe('document');
    expect(sanitizeExportFilename('/\\:*?')).toBe('document');
    expect(sanitizeExportFilename('')).toBe('document');
  });
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

describe('exportPDFViaPrint', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fakeIframe: any;
  let printMock: ReturnType<typeof vi.fn>;
  let focusMock: ReturnType<typeof vi.fn>;
  let removeMock: ReturnType<typeof vi.fn>;
  let appendChildMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    printMock = vi.fn();
    focusMock = vi.fn();
    removeMock = vi.fn();
    appendChildMock = vi.fn();

    const fakeWindow = {
      focus: focusMock,
      print: printMock,
      onafterprint: null as null | (() => void),
      document: {
        // `fonts.ready` resolves immediately so the print path runs.
        fonts: { ready: Promise.resolve() },
      },
    };

    fakeIframe = {
      setAttribute: vi.fn(),
      style: {},
      remove: removeMock,
      onload: null as null | (() => void),
      // Track the written document so assertions can inspect it.
      _srcdoc: '',
      set srcdoc(value: string) {
        this._srcdoc = value;
      },
      get srcdoc() {
        return this._srcdoc;
      },
      contentWindow: fakeWindow,
    };

    const mockDocument = {
      createElement: vi.fn().mockReturnValue(fakeIframe),
      body: { appendChild: appendChildMock },
    };

    Object.defineProperty(globalThis, 'document', {
      value: mockDocument,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).document;
  });

  it('builds a print document, appends an iframe, and prints once loaded', async () => {
    const htmlContent = '<h1>Test content</h1>';

    exportPDFViaPrint(htmlContent, 'my-report');

    // The iframe is appended and its srcdoc contains the wrapped content.
    expect(document.createElement).toHaveBeenCalledWith('iframe');
    expect(appendChildMock).toHaveBeenCalledWith(fakeIframe);
    expect(fakeIframe.srcdoc).toContain('<!DOCTYPE html>');
    expect(fakeIframe.srcdoc).toContain('<h1>Test content</h1>');
    // The title (suggested filename) is set from the provided name.
    expect(fakeIframe.srcdoc).toContain('<title>my-report</title>');
    // Print-fidelity rules are present.
    expect(fakeIframe.srcdoc).toContain('@page');
    expect(fakeIframe.srcdoc).toContain('print-color-adjust: exact');

    // Simulate the iframe finishing load, then flush the fonts.ready promise.
    fakeIframe.onload();
    await Promise.resolve();

    expect(focusMock).toHaveBeenCalled();
    expect(printMock).toHaveBeenCalled();

    // Cleanup runs after the dialog closes.
    fakeIframe.contentWindow.onafterprint();
    expect(removeMock).toHaveBeenCalled();
  });

  it('defaults the document title to "document" when the title is blank', async () => {
    exportPDFViaPrint('<p>hello</p>', '   ');

    expect(fakeIframe.srcdoc).toContain('<title>document</title>');
  });

  it('escapes HTML-significant characters in the title', async () => {
    exportPDFViaPrint('<p>hello</p>', 'a<b>&"c');

    expect(fakeIframe.srcdoc).toContain('<title>a&lt;b&gt;&amp;&quot;c</title>');
  });
});
