function LoadingSpinner() {
  return (
    <div className="loading-screen">
      <div className="loading-animation">
        <div className="pulse-ring"></div>
        <div className="pulse-ring delay-1"></div>
        <div className="pulse-ring delay-2"></div>
        <span className="loading-icon">🔎</span>
      </div>
      <p className="loading-text">Searching for similar blogs...</p>
      <p className="loading-subtext">Powered by Gemini AI</p>
    </div>
  );
}

export default LoadingSpinner;
