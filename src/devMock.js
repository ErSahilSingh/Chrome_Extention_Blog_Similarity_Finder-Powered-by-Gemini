/* ── Chrome API Mock for Dev Preview ── */
// This file provides mock implementations of chrome.* APIs
// so the popup can be previewed in a regular browser via `npm run dev`.

if (typeof globalThis.chrome === 'undefined' || !globalThis.chrome?.storage) {
  const store = {};

  globalThis.chrome = {
    storage: {
      local: {
        get(keys, callback) {
          const result = {};
          const keyList = Array.isArray(keys) ? keys : [keys];
          keyList.forEach(k => {
            if (store[k] !== undefined) result[k] = store[k];
          });
          if (callback) return callback(result);
          return Promise.resolve(result);
        },
        set(items, callback) {
          Object.assign(store, items);
          if (callback) return callback();
          return Promise.resolve();
        },
        remove(keys, callback) {
          const keyList = Array.isArray(keys) ? keys : [keys];
          keyList.forEach(k => delete store[k]);
          if (callback) return callback();
          return Promise.resolve();
        },
      },
    },
    runtime: {
      sendMessage(message, callback) {
        // Mock responses for dev preview
        if (message.type === 'GET_PAGE_META') {
          setTimeout(() => callback({
            data: {
              title: 'How to Build a Chrome Extension with React & Vite',
              description: 'A comprehensive guide to building modern Chrome extensions using React, Vite, and Manifest V3 with best practices.',
              url: 'https://dev.to/example/chrome-extension-react-vite',
            }
          }), 300);
        } else if (message.type === 'VALIDATE_KEY') {
          setTimeout(() => callback({ valid: true }), 800);
        } else if (message.type === 'CALL_GEMINI') {
          setTimeout(() => callback({
            data: [
              { title: 'Building Browser Extensions with Modern Frameworks', url: 'https://dev.to/nickytonline/browser-extensions-modern-frameworks', reason: 'Covers the same React + extension pattern' },
              { title: 'Chrome Extensions: From Zero to Production', url: 'https://medium.com/@nicktomlin/chrome-extensions-zero-to-production', reason: 'End-to-end extension development guide' },
              { title: 'Manifest V3 Migration Guide', url: 'https://developer.chrome.com/docs/extensions/mv3/intro', reason: 'Official V3 migration reference' },
              { title: 'Vite for Chrome Extensions: The Modern Approach', url: 'https://hashnode.dev/post/vite-chrome-extensions', reason: 'Vite-specific extension setup and tooling' },
              { title: 'React in Chrome Extensions: Best Practices', url: 'https://freecodecamp.org/news/react-chrome-extensions', reason: 'React patterns for extension popups' },
              { title: 'Service Workers in Chrome Extensions Explained', url: 'https://smashingmagazine.com/service-workers-extensions', reason: 'Deep dive into MV3 service workers' },
              { title: 'Content Scripts: DOM Manipulation Guide', url: 'https://css-tricks.com/content-scripts-guide', reason: 'Content script patterns and DOM interaction' },
              { title: 'Securing Your Chrome Extension: API Keys & Storage', url: 'https://blog.chromium.org/extension-security-guide', reason: 'Security best practices for extensions' },
            ],
            dailyCount: 3,
          }), 1500);
        } else {
          setTimeout(() => callback({}), 100);
        }
      },
    },
    tabs: {
      query(opts, callback) {
        if (callback) callback([{ id: 1, url: 'https://dev.to/example', title: 'Example Blog' }]);
      },
      sendMessage(tabId, message, callback) {
        if (callback) callback({ title: 'Example', description: 'Example blog post' });
      },
    },
  };
}
