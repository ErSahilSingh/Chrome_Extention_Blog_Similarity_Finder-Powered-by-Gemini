import { useState } from 'react';
import { validateApiKey } from '../services/geminiApi';
import { saveApiKey } from '../services/storage';

function SetupScreen({ onKeySetup }) {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState('idle'); // idle | validating | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleValidate = async () => {
    const trimmed = key.trim();
    if (!trimmed) return;

    setStatus('validating');
    setErrorMsg('');

    const result = await validateApiKey(trimmed);

    if (result?.valid) {
      await saveApiKey(trimmed);
      onKeySetup(trimmed);
    } else {
      setStatus('error');
      setErrorMsg(result?.error || 'Invalid API key. Please try again.');
    }
  };

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="setup-icon">🔑</div>
        <h2>Setup Your API Key</h2>
        <p className="setup-desc">
          Enter your Gemini API key to get started. Your key is stored locally
          and never shared.
        </p>

        <div className="input-group">
          <input
            type="password"
            placeholder="Paste your Gemini API key..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            disabled={status === 'validating'}
            autoFocus
          />
          <button
            className="btn btn-primary"
            onClick={handleValidate}
            disabled={!key.trim() || status === 'validating'}
          >
            {status === 'validating' ? (
              <>
                <span className="spinner-sm" /> Validating...
              </>
            ) : (
              'Validate & Save'
            )}
          </button>
        </div>

        {status === 'error' && (
          <div className="error-msg">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        <div className="setup-instructions">
          <h3>How to get your free API key:</h3>
          <ol>
            <li>
              Go to{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
                Google AI Studio
              </a>
            </li>
            <li>Sign in with your Google account</li>
            <li>Click <strong>"Create API Key"</strong></li>
            <li>Copy the key and paste it above</li>
          </ol>
          <p className="setup-note">
            💡 The free tier allows ~15 requests/minute. This extension is
            optimized to stay well within limits.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SetupScreen;
