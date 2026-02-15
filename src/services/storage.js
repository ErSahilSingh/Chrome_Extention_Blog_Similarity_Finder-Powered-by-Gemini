/* ── Storage Service ── */

const STORAGE_KEYS = {
  API_KEY: 'gemini_api_key',
  DAILY_COUNT: 'dailyCount',
  DAILY_DATE: 'dailyDate',
  SAVED_RESULTS: 'savedResults',
  THEME: 'theme',
};

// ── API Key ──
export async function getApiKey() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.API_KEY);
  return data[STORAGE_KEYS.API_KEY] || null;
}

export async function saveApiKey(key) {
  await chrome.storage.local.set({ [STORAGE_KEYS.API_KEY]: key });
}

export async function removeApiKey() {
  await chrome.storage.local.remove(STORAGE_KEYS.API_KEY);
}

// ── Daily Request Counter ──
export async function getDailyCount() {
  const today = new Date().toISOString().slice(0, 10);
  const data = await chrome.storage.local.get([STORAGE_KEYS.DAILY_COUNT, STORAGE_KEYS.DAILY_DATE]);
  if (data[STORAGE_KEYS.DAILY_DATE] === today) {
    return data[STORAGE_KEYS.DAILY_COUNT] || 0;
  }
  return 0;
}

// ── Saved Results ──
export async function getSavedResults() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.SAVED_RESULTS);
  return data[STORAGE_KEYS.SAVED_RESULTS] || [];
}

export async function saveResults(results) {
  const existing = await getSavedResults();
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    results,
  };
  await chrome.storage.local.set({
    [STORAGE_KEYS.SAVED_RESULTS]: [entry, ...existing].slice(0, 20), // keep last 20
  });
}

export async function clearResults() {
  await chrome.storage.local.remove(STORAGE_KEYS.SAVED_RESULTS);
}

// ── Theme ──
export async function getTheme() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.THEME);
  return data[STORAGE_KEYS.THEME] || 'dark';
}

export async function setTheme(theme) {
  await chrome.storage.local.set({ [STORAGE_KEYS.THEME]: theme });
}
