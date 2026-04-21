import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this view right now.',
  actionLabel = 'Try again',
  onRetry,
}) {
  return (
    <section className="premium-page utility-page">
      <div className="premium-card-block utility-card utility-card--error">
        <div className="utility-icon-wrap utility-icon-wrap--error">
          <AlertTriangle size={28} />
        </div>
        <div className="utility-copy">
          <h1>{title}</h1>
          <p>{message}</p>
        </div>
        {typeof onRetry === 'function' ? (
          <button type="button" className="panel-button" onClick={onRetry}>
            <RefreshCcw size={16} />
            <span>{actionLabel}</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
