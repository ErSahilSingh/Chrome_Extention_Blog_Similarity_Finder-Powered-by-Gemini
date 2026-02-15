function ErrorScreen({ error, isQuota, onRetry }) {
  return (
    <div className="error-screen">
      <div className="error-card">
        <span className="error-icon">{isQuota ? '⚠️' : '❌'}</span>
        <h3>{isQuota ? 'Quota Limit Reached' : 'Something Went Wrong'}</h3>
        <p className="error-detail">{error}</p>
      {isQuota ? (
        <div className="error-actions">
          <p className="error-help">
            The Gemini free tier has usage limits. Please wait a few minutes or try again later.
          </p>
          <a
            href="https://aistudio.google.com/app/plan"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ display: 'inline-block', marginTop: '8px', textDecoration: 'none' }}
          >
            Check Quota
          </a>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={onRetry}>
            🔄 Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorScreen;
