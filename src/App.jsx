import { useState, useEffect, useCallback } from 'react';
import { getApiKey, getTheme, setTheme as saveTheme, getDailyCount } from './services/storage';
import SetupScreen from './components/SetupScreen';
import MainScreen from './components/MainScreen';
import Header from './components/Header';

/*
  App States:
  - setup        → No API key stored; show setup screen
  - idle         → Key stored; ready to search
  - loading      → Gemini request in progress
  - results      → Results loaded
  - error        → Error occurred
*/

function App() {
  const [appState, setAppState] = useState('loading_init'); // initial loading
  const [apiKey, setApiKey] = useState(null);
  const [theme, setThemeState] = useState('dark');
  const [dailyCount, setDailyCount] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [pageMeta, setPageMeta] = useState(null);

  // Initialize
  useEffect(() => {
    async function init() {
      const [key, savedTheme, count] = await Promise.all([
        getApiKey(),
        getTheme(),
        getDailyCount(),
      ]);
      setThemeState(savedTheme);
      setDailyCount(count);
      if (key) {
        setApiKey(key);
        setAppState('idle');
      } else {
        setAppState('setup');
      }
    }
    init();
  }, []);

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    await saveTheme(newTheme);
  }, [theme]);

  const handleKeySetup = useCallback((key) => {
    setApiKey(key);
    setAppState('idle');
  }, []);

  const handleResetKey = useCallback(() => {
    setApiKey(null);
    setAppState('setup');
    setResults(null);
    setError(null);
  }, []);

  if (appState === 'loading_init') {
    return (
      <div className="app-container">
        <div className="init-loader">
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        showSettings={appState !== 'setup'}
        onResetKey={handleResetKey}
        dailyCount={dailyCount}
      />

      {appState === 'setup' ? (
        <SetupScreen onKeySetup={handleKeySetup} />
      ) : (
        <MainScreen
          apiKey={apiKey}
          appState={appState}
          setAppState={setAppState}
          results={results}
          setResults={setResults}
          error={error}
          setError={setError}
          dailyCount={dailyCount}
          setDailyCount={setDailyCount}
          pageMeta={pageMeta}
          setPageMeta={setPageMeta}
        />
      )}
    </div>
  );
}

export default App;
