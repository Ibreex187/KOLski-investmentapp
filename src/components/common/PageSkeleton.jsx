function SkeletonLine({ className = '' }) {
  return <span className={`skeleton-line ${className}`.trim()} aria-hidden="true" />;
}

export default function PageSkeleton({ variant = 'dashboard' }) {
  const isTable = variant === 'table';
  const isSimple = variant === 'simple';

  return (
    <section className="premium-page page-skeleton" aria-label="Loading content">
      <div className="page-hero compact-hero skeleton-surface">
        <div className="skeleton-stack">
          <SkeletonLine className="skeleton-line--kicker" />
          <SkeletonLine className="skeleton-line--title" />
          <SkeletonLine className="skeleton-line--body" />
        </div>

        {!isSimple ? (
          <div className="hero-badge-card skeleton-surface skeleton-badge">
            <SkeletonLine className="skeleton-line--label" />
            <SkeletonLine className="skeleton-line--value" />
          </div>
        ) : null}
      </div>

      {!isSimple ? (
        <div className="stats-grid skeleton-grid">
          {[1, 2, 3].map((item) => (
            <article key={item} className="premium-card-block stat-block skeleton-surface">
              <SkeletonLine className="skeleton-line--label" />
              <SkeletonLine className="skeleton-line--value" />
              <SkeletonLine className="skeleton-line--small" />
            </article>
          ))}
        </div>
      ) : null}

      <div className={`content-grid ${isTable || isSimple ? 'single-grid' : ''}`}>
        <article className="premium-card-block feature-panel skeleton-surface">
          <div className="skeleton-stack">
            <SkeletonLine className="skeleton-line--title-sm" />
            <SkeletonLine className="skeleton-line--body" />
            <SkeletonLine className="skeleton-line--body short" />
          </div>

          {isTable ? (
            <div className="skeleton-table">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="holding-row skeleton-row">
                  <SkeletonLine className="skeleton-line--row" />
                  <SkeletonLine className="skeleton-line--row" />
                  <SkeletonLine className="skeleton-line--row" />
                  <SkeletonLine className="skeleton-line--row" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mini-bars skeleton-bars">
              <span style={{ width: '82%' }} />
              <span style={{ width: '65%' }} />
              <span style={{ width: '91%' }} />
            </div>
          )}
        </article>

        {!isTable && !isSimple ? (
          <article className="premium-card-block feature-panel skeleton-surface">
            <div className="skeleton-stack">
              <SkeletonLine className="skeleton-line--title-sm" />
              <SkeletonLine className="skeleton-line--body" />
              <SkeletonLine className="skeleton-line--body short" />
              <SkeletonLine className="skeleton-line--body short" />
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
