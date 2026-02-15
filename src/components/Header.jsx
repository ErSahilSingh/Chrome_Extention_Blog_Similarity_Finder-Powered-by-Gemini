import { useState } from 'react';

function Header({ theme, toggleTheme, showSettings, onResetKey, dailyCount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-icon">🔎</span>
        <div>
          <h1 className="header-title">Blog Similarity Finder</h1>
          <span className="header-subtitle">Powered by Gemini AI</span>
        </div>
      </div>

      <div className="header-right">
        {showSettings && (
          <span className="daily-badge" title="Requests today">
            {dailyCount}/50
          </span>
        )}

        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {showSettings && (
          <div className="settings-wrap">
            <button
              className="icon-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              title="Settings"
              aria-label="Settings"
            >
              ⚙️
            </button>
            {menuOpen && (
              <div className="dropdown-menu">
                <button onClick={() => { onResetKey(); setMenuOpen(false); }}>
                  Change API Key
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
