import StatusBadge from './StatusBadge';

export default function SectionPanel({
  kicker,
  title,
  description,
  status,
  children,
  className = '',
}) {
  return (
    <article className={`premium-card-block feature-panel ${className}`.trim()}>
      <div className="panel-head">
        <div>
          {kicker ? <span className="page-kicker">{kicker}</span> : null}
          <h2>{title}</h2>
        </div>
        <StatusBadge {...status} />
      </div>

      {description ? <p>{description}</p> : null}
      {children}
    </article>
  );
}
