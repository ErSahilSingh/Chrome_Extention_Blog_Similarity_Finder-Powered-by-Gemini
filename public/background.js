/* ── Background Service Worker (Manifest V3) ── */

let lastRequestTime = 0;
const RATE_LIMIT_MS = 5000; // 5 seconds between requests

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PAGE_META') {
    handleGetPageMeta(sendResponse);
    return true; // keep channel open for async
  }

  if (message.type === 'CALL_GEMINI') {
    handleCallGemini(message.payload, sendResponse);
    return true;
  }

  if (message.type === 'VALIDATE_KEY') {
    handleValidateKey(message.payload.apiKey, sendResponse);
    return true;
  }
});

async function handleGetPageMeta(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) {
      sendResponse({ error: 'Please navigate to an HTTP/HTTPS page.' });
      return;
    }

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_META' });
      sendResponse({ data: { ...response, url: tab.url } });
    } catch {
      // Content script may not be injected — fallback to tab info
      sendResponse({
        data: {
          title: tab.title || 'Unknown',
          description: '',
          url: tab.url,
        },
      });
    }
  } catch (err) {
    sendResponse({ error: err.message });
  }
}

async function handleValidateKey(apiKey, sendResponse) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "ok"' }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      }
    );

    if (res.ok) {
      sendResponse({ valid: true });
    } else {
      const data = await res.json();
      sendResponse({ valid: false, error: data.error?.message || 'Invalid API key' });
    }
  } catch (err) {
    sendResponse({ valid: false, error: 'Network error: ' + err.message });
  }
}

async function handleCallGemini(payload, sendResponse) {
  const { apiKey, title, description, url } = payload;

  // Rate limiting
  const now = Date.now();
  if (now - lastRequestTime < RATE_LIMIT_MS) {
    const waitSec = Math.ceil((RATE_LIMIT_MS - (now - lastRequestTime)) / 1000);
    sendResponse({ error: `Rate limited. Please wait ${waitSec}s before trying again.` });
    return;
  }

  // Daily counter check
  const today = new Date().toISOString().slice(0, 10);
  const storage = await chrome.storage.local.get(['dailyCount', 'dailyDate']);
  let dailyCount = storage.dailyDate === today ? (storage.dailyCount || 0) : 0;

  if (dailyCount >= 50) {
    sendResponse({ error: 'Daily quota reached (50 requests). Try again tomorrow.', quotaExceeded: true });
    return;
  }

  lastRequestTime = now;

  const prompt = `Based on this blog article:
Title: "${title}"
Description: "${description || 'N/A'}"
URL: ${url}

Suggest 8 similar blog articles that a reader would find interesting. For each, provide a realistic blog URL from well-known educational or blog-style domains (like medium.com, dev.to, freecodecamp.org, hashnode.dev, smashingmagazine.com, css-tricks.com, etc.).

Return ONLY a valid JSON array, no markdown, no explanation:
[{"title":"...","url":"https://...","reason":"one line why it's similar"}]`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        }),
      }
    );

    if (res.status === 429) {
      sendResponse({ error: 'Gemini API quota exceeded. Please wait and try again later.', quotaExceeded: true });
      return;
    }

    if (!res.ok) {
      const errData = await res.json();
      const errorMsg = errData.error?.message || errData.error?.details?.[0]?.message || 'API request failed.';
      sendResponse({ error: errorMsg });
      return;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON from response (handle possible markdown wrapping)
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const results = JSON.parse(jsonStr);

    // Increment daily counter
    dailyCount += 1;
    await chrome.storage.local.set({ dailyCount, dailyDate: today });

    sendResponse({ data: results, dailyCount });
  } catch (err) {
    sendResponse({ error: 'Failed to parse Gemini response: ' + err.message });
  }
}
