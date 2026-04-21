import AnimatedNumber from './AnimatedNumber';
import StatusBadge from './StatusBadge';

export default function PageHero({ kicker, title, description, badge, compact = false }) {
  return (
    <div className={`page-hero ${compact ? 'compact-hero' : ''}`}>
      <div>
        {kicker ? <span className="page-kicker">{kicker}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>

      {badge ? (
        <div className="hero-badge-card hero-badge-card--live">
          <div className="hero-badge-card__head">
            <span>{badge.label}</span>
            <StatusBadge {...badge.status} />
          </div>
          <strong>
            <AnimatedNumber
              value={badge.value}
              prefix={badge.prefix}
              suffix={badge.suffix}
              decimals={badge.decimals}
            />
          </strong>
          {badge.caption ? <small>{badge.caption}</small> : null}
        </div>
      ) : null}
    </div>
  );
}
