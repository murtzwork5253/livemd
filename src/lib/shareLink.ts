/**
 * Encodes a string (UTF-8) to a compressed browser-safe Base64 string prefixed with 'v2:'.
 */
export async function encodeDocument(content: string, title: string): Promise<string> {
  const payload = JSON.stringify({ content, title, v: 2 });
  try {
    const stream = new Blob([payload]).stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    const buffer = await new Response(compressedStream).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binaryString = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    return 'v2:' + btoa(binaryString);
  } catch (err) {
    console.warn('Compression failed, falling back to legacy encoding:', err);
    const utf8Bytes = new TextEncoder().encode(payload);
    const binaryString = Array.from(utf8Bytes).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      '',
    );
    return btoa(binaryString);
  }
}

/**
 * Decodes a Base64 string back to its original document payload (supports both compressed and legacy uncompressed).
 */
export async function decodeDocument(encoded: string): Promise<{ content: string; title: string } | null> {
  try {
    if (encoded.startsWith('v2:')) {
      const cleanEncoded = encoded.slice(3);
      const binaryString = atob(cleanEncoded);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const stream = new Blob([bytes]).stream();
      const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
      const payloadStr = await new Response(decompressedStream).text();
      const parsed = JSON.parse(payloadStr);
      
      if (parsed && typeof parsed.content === 'string' && typeof parsed.title === 'string') {
        return { content: parsed.content, title: parsed.title };
      }
      return null;
    } else {
      // Legacy uncompressed decoding
      const binaryString = atob(encoded);
      const bytes = new Uint8Array(binaryString.split('').map((char) => char.charCodeAt(0)));
      const payloadStr = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(payloadStr);
      
      if (parsed && typeof parsed.content === 'string' && typeof parsed.title === 'string') {
        return { content: parsed.content, title: parsed.title };
      }
      return null;
    }
  } catch (err) {
    console.error('Failed to decode shared document:', err);
    return null;
  }
}

/**
 * Builds a full URL with the encoded document inside the search query parameters.
 */
export async function buildShareURL(content: string, title: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  const encoded = await encodeDocument(content, title);
  const url = new URL(window.location.href);
  url.searchParams.set('share', encoded);
  url.hash = ''; // Clear any internal anchor headings hashes
  return url.toString();
}

/**
 * Parses query parameters and decodes the shared document payload if present.
 */
export async function getSharedDocFromURL(): Promise<{ content: string; title: string } | null> {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('share');
  return encoded ? decodeDocument(encoded) : null;
}
