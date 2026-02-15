/* ── Gemini API Service ── */

export function validateApiKey(apiKey) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'VALIDATE_KEY', payload: { apiKey } },
      (response) => {
        resolve(response);
      }
    );
  });
}

export function findSimilarBlogs(apiKey, meta) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: 'CALL_GEMINI',
        payload: {
          apiKey,
          title: meta.title,
          description: meta.description,
          url: meta.url,
        },
      },
      (response) => {
        resolve(response);
      }
    );
  });
}

export function getPageMeta() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_PAGE_META' }, (response) => {
      resolve(response);
    });
  });
}
