function ResultsScreen({ results, onSave, onNewSearch }) {
  return (
    <div className="results-screen">
      <div className="results-header">
        <h3>Similar Blogs Found</h3>
        <span className="results-count">{results.length} results</span>
      </div>

      <div className="results-list">
        {results.map((item, i) => (
          <a
            key={i}
            className="result-card"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="result-index">{i + 1}</div>
            <div className="result-content">
              <h4 className="result-title">{item.title}</h4>
              <p className="result-reason">{item.reason}</p>
              <span className="result-url">{item.url}</span>
            </div>
            <span className="result-arrow">→</span>
          </a>
        ))}
      </div>

      <div className="results-actions">
        <button className="btn btn-secondary" onClick={onSave}>
          💾 Save Results
        </button>
        <button className="btn btn-primary" onClick={onNewSearch}>
          🔍 New Search
        </button>
      </div>
    </div>
  );
}

export default ResultsScreen;
