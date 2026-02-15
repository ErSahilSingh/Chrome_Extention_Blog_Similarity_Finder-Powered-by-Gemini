import { useEffect, useState, useCallback } from 'react';
import { findSimilarBlogs, getPageMeta } from '../services/geminiApi';
import { saveResults, getSavedResults, clearResults } from '../services/storage';
import ResultsScreen from './ResultsScreen';
import LoadingSpinner from './LoadingSpinner';
import ErrorScreen from './ErrorScreen';
import QuotaWarning from './QuotaWarning';

function MainScreen({
  apiKey,
  appState,
  setAppState,
  results,
  setResults,
  error,
  setError,
  dailyCount,
  setDailyCount,
  pageMeta,
  setPageMeta,
}) {
  const [savedHistory, setSavedHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    const saved = await getSavedResults();
    setSavedHistory(saved);
  }, []);

  // Fetch page metadata on mount
  useEffect(() => {
    async function fetchMeta() {
      const res = await getPageMeta();
      if (res?.data) {
        setPageMeta(res.data);
      } else {
        setPageMeta({ title: 'Unable to detect page', description: '', url: '' });
      }
    }
    fetchMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadHistory();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!pageMeta?.title) return;
    setAppState('loading');
    setError(null);

    const res = await findSimilarBlogs(apiKey, pageMeta);

    if (res?.error) {
      setError(res.error);
      setAppState(res.quotaExceeded ? 'quota_warning' : 'error');
    } else if (res?.data) {
      setResults(res.data);
      setDailyCount(res.dailyCount || dailyCount + 1);
      setAppState('results');
    } else {
      setError('Unexpected response from Gemini.');
      setAppState('error');
    }
  }, [apiKey, pageMeta, dailyCount, setAppState, setError, setResults, setDailyCount]);

  const handleSave = useCallback(async () => {
    if (results) {
      await saveResults(results);
      await loadHistory();
    }
  }, [results, loadHistory]);

  const handleClearHistory = useCallback(async () => {
    await clearResults();
    setSavedHistory([]);
  }, []);

  const handleRetry = useCallback(() => {
    setAppState('idle');
    setError(null);
  }, [setAppState, setError]);

  return (
    <div className="main-screen">
      {dailyCount >= 40 && appState !== 'quota_warning' && (
        <QuotaWarning count={dailyCount} />
      )}

      {/* Page Info */}
      {pageMeta && appState !== 'loading' && (
        <div className="page-info-card">
          <div className="page-info-label">Current Page</div>
          <h3 className="page-info-title">{pageMeta.title || 'No title detected'}</h3>
          {pageMeta.description && (
            <p className="page-info-desc">{pageMeta.description.slice(0, 120)}...</p>
          )}
          {pageMeta.url && (
            <span className="page-info-url">{pageMeta.url.slice(0, 50)}...</span>
          )}
        </div>
      )}

      {/* Action Area */}
      {appState === 'idle' && (
        <button
          className="btn btn-primary btn-search"
          onClick={handleSearch}
          disabled={!pageMeta?.url}
        >
          <span className="btn-icon">🔍</span>
          Find Similar Blogs
        </button>
      )}

      {appState === 'loading' && <LoadingSpinner />}

      {appState === 'results' && results && (
        <ResultsScreen
          results={results}
          onSave={handleSave}
          onNewSearch={handleRetry}
        />
      )}

      {(appState === 'error' || appState === 'quota_warning') && (
        <ErrorScreen
          error={error}
          isQuota={appState === 'quota_warning'}
          onRetry={handleRetry}
        />
      )}

      {/* History Section */}
      {savedHistory.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <button
              className="btn btn-ghost"
              onClick={() => setShowHistory(!showHistory)}
            >
              📜 {showHistory ? 'Hide' : 'Show'} History ({savedHistory.length})
            </button>
            <button className="btn btn-ghost btn-danger" onClick={handleClearHistory}>
              🗑️ Clear
            </button>
          </div>
          {showHistory && (
            <div className="history-list">
              {savedHistory.map((entry) => (
                <div key={entry.id} className="history-entry">
                  <span className="history-time">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                  <span className="history-count">
                    {entry.results.length} results
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MainScreen;
