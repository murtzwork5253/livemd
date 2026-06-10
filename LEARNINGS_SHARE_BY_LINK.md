# Developer Learning Guide: Share by Link (Read-Only)

This guide documents the technical architecture, design decisions, browser APIs, and React patterns used to implement the database-free **Share by Link** feature in LiveMD.

---

## 💡 Core Concept: Serverless Client-Side sharing

Traditional sharing features require:
1. A backend server (Node.js/Python/Go)
2. A relational or key-value database (PostgreSQL/MongoDB/Redis)
3. API endpoints for uploading and retrieving payloads
4. Authentication, hosting costs, and security oversight

**Share by Link** bypasses all server infrastructure. It compresses and encodes the entire document state (both its title and markdown content) into a short Base64 string and appends it directly to the URL's query parameters. 

Anyone who opens this URL has the entire document payload loaded instantly by their browser. **Infrastructure cost: $0. Data privacy: 100% (no document content ever leaves the client).**

---

## 🛠️ Key Browser APIs Used

### 1. Unicode-Safe Base64 Conversion (`TextEncoder` & `TextDecoder`)
Standard browser Base64 functions `btoa()` (binary to ASCII) and `atob()` (ASCII to binary) only work on 8-bit characters. If a user types a Unicode character (like an emoji `👋` or a non-English character), `btoa()` throws an `InvalidCharacterError` exception.

To resolve this safely without deprecated methods like `escape` or `unescape`:
- **Encoding:** Convert the JSON payload into UTF-8 bytes using `TextEncoder`, then map each byte to a binary string character before calling `btoa`:
  ```typescript
  const utf8Bytes = new TextEncoder().encode(payload);
  const binaryString = Array.from(utf8Bytes).reduce((data, byte) => data + String.fromCharCode(byte), '');
  const encoded = btoa(binaryString);
  ```
- **Decoding:** Decode the Base64 string back to a binary string, recreate the byte array, and decode it into a standard JavaScript string with `TextDecoder`:
  ```typescript
  const binaryString = atob(encoded);
  const bytes = new Uint8Array(binaryString.split('').map(char => char.charCodeAt(0)));
  const payloadStr = new TextDecoder().decode(bytes);
  ```

### 2. Payload Size Evaluation (`TextEncoder.encode().length`)
Browsers and email clients have limits on URL length (typically around 8KB is recommended for older clients, though modern browsers support more). We measure the generated link size in bytes and block sharing if it exceeds 8KB:
```typescript
const sizeBytes = new TextEncoder().encode(url).length;
const sizeKB = Number((sizeBytes / 1024).toFixed(1));
const tooLarge = sizeKB > 8.0;
```
If a document exceeds 8KB, the app automatically transitions to a warning view suggesting the user download it as a file using the **Export** menu.

### 3. URL Parameter Manipulation (`URLSearchParams` & `history.replaceState`)
To load the document, we read the URL query parameters. To clean up the interface after dismissing the banner or creating a personal copy, we strip the `?share=` query parameter **without triggering a full page reload** using `replaceState`:
```typescript
const url = new URL(window.location.href);
url.searchParams.delete('share');
window.history.replaceState({}, '', url.pathname + url.search);
```

---

## ⚛️ React.js Architecture & Patterns

### 1. Context Hydration on Mount
Normally, on initial load, the app queries IndexedDB for existing files and loads the last edited document. When a shared link is opened, we want to intercept this flow:
```typescript
useEffect(() => {
  const initDocsAndShare = async () => {
    await loadAllDocs(); // Load sidebar list in the background
    const shared = getSharedDocFromURL();
    if (shared) {
      sharedDocRef.current = shared; // Store shared metadata to avoid state clutter
      dispatch({ type: 'SET_MARKDOWN', payload: shared.content });
      dispatch({ type: 'SET_VIEW_MODE', payload: 'preview' }); // Force preview
      dispatch({ type: 'SET_SHARED_VIEW', payload: true }); // Show banner
    }
  };
  initDocsAndShare();
}, []);
```
By loading the local files in the background but immediately overwriting the active editor state with the shared content, the user retains access to their files while previewing the share.

### 2. State Isolation using Refs (`useRef`)
The shared document title and content are needed *only* when the user clicks the "Edit Copy" button. If we stored this metadata in a React state variable, changing it would trigger component re-renders.
By storing it in a Ref (`sharedDocRef.current`), we keep the workspace snappy and render-free while keeping the data safely cached for the copy creation action.

### 3. UI/UX Banner Placement
The sticky shared banner sits directly between the `<header>` and the `.app-body` workspace wrapper. This pushes the editing panels down naturally. 
We used CSS `animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)` to slide the banner down smoothly, making it feel organic and premium.

---

## 🧪 How to Verify Your Learning

1. Create a document with complex headers, emojis, and styling.
2. Click **Share** and copy the generated link.
3. Open a new Incognito browser tab, paste the link, and see how the preview renders instantly with the sticky high-contrast banner.
4. Click **Edit Copy** and verify that it is instantly added to your local sidebar document list and switches you to editing split-pane mode.
