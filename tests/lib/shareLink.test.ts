import { describe, it, expect } from 'vitest';
import { encodeDocument, decodeDocument } from '../../src/lib/shareLink';

describe('shareLink compression and decoding', () => {
  it('should encode and decode a document successfully', async () => {
    const title = 'Test Document';
    const content = 'This is a sample document content with some formatting and emojis 🚀.';
    
    const encoded = await encodeDocument(content, title);
    expect(encoded.startsWith('v2:')).toBe(true);
    
    const decoded = await decodeDocument(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.title).toBe(title);
    expect(decoded?.content).toBe(content);
  });

  it('should be backward-compatible with legacy uncompressed encoded documents', async () => {
    // Generate a legacy payload
    const legacyPayload = JSON.stringify({ content: 'Legacy content', title: 'Legacy Title', v: 1 });
    const utf8Bytes = new TextEncoder().encode(legacyPayload);
    const binaryString = Array.from(utf8Bytes).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      '',
    );
    const legacyEncoded = btoa(binaryString);

    // Verify it does not start with v2:
    expect(legacyEncoded.startsWith('v2:')).toBe(false);

    // Decode and verify compatibility
    const decoded = await decodeDocument(legacyEncoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.title).toBe('Legacy Title');
    expect(decoded?.content).toBe('Legacy content');
  });

  it('should handle corrupt or invalid payloads gracefully', async () => {
    const invalidEncoded = 'v2:not-a-valid-base64-gzip-string';
    const decoded = await decodeDocument(invalidEncoded);
    expect(decoded).toBeNull();
  });
});
