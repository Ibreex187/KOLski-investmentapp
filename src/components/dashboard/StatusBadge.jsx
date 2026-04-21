export default function StatusBadge({ label, tone = 'neutral', live = false }) {
  if (!label) return null;

  return (
    <span className={`status-indicator status-indicator--${tone}`}>
      {live ? <span className="status-indicator__dot" aria-hidden="true" /> : null}
      <span>{label}</span>
    </span>
  );
}
