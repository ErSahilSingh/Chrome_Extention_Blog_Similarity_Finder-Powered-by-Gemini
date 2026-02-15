function QuotaWarning({ count }) {
  return (
    <div className="quota-warning">
      <span>⚠️</span>
      <span>
        You've made <strong>{count}/50</strong> requests today. Approaching daily limit.
      </span>
    </div>
  );
}

export default QuotaWarning;
