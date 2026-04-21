export default function InlineLoader({ label = 'Loading...', size = 'sm' }) {
  return (
    <span className={`inline-loader inline-loader--${size}`} aria-live="polite">
      <span className="inline-loader__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {label ? <span>{label}</span> : null}
    </span>
  );
}
