import '@testing-library/jest-dom';

// ─── localStorage mock ──────────────────────────────────────────────────────
// jsdom provides a basic localStorage, but we add a spy-friendly wrapper
// so tests can assert on calls.
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// ─── crypto.subtle mock ─────────────────────────────────────────────────────
// auth.js uses crypto.subtle.digest('SHA-256', ...) for password hashing.
// In jsdom this may not be available, so we provide a deterministic mock.
if (!globalThis.crypto?.subtle) {
  const subtle = {
    digest: vi.fn(async (_algo, data) => {
      // Return a deterministic ArrayBuffer derived from the input bytes
      // so that the same password always produces the same hash.
      const bytes = new Uint8Array(data);
      const hash = new Uint8Array(32);
      for (let i = 0; i < bytes.length; i++) {
        hash[i % 32] = (hash[i % 32] + bytes[i]) & 0xff;
      }
      return hash.buffer;
    }),
  };

  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, 'crypto', {
      value: { subtle },
    });
  } else {
    Object.defineProperty(globalThis.crypto, 'subtle', {
      value: subtle,
    });
  }
}

// ─── fetch mock (reset per test) ────────────────────────────────────────────
// Individual tests should mock fetch as needed. We just ensure it exists.
if (!globalThis.fetch) {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  );
}

// ─── Reset mocks between tests ──────────────────────────────────────────────
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});
