import AnimatedNumber from './AnimatedNumber';
import StatusBadge from './StatusBadge';

export default function StatCard({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  change,
  tone = 'positive',
  status,
}) {
  return (
    <article className="premium-card-block stat-block">
      <div className="stat-block__top">
        <span>{label}</span>
        <StatusBadge {...status} />
      </div>

      <strong>
        <AnimatedNumber
          value={Number(value) || 0}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
      </strong>

      {change ? <small className={tone === 'positive' ? 'positive-text' : 'stat-note'}>{change}</small> : null}
    </article>
  );
}
