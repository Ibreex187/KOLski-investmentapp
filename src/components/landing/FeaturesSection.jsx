export default function FeaturesSection({ featureCards = [] }) {
  return (
    <section className="landing-section">
      <div className="landing-section__head">
        <span className="page-kicker">Core benefits</span>
        <h2>Start with the three things users care about most</h2>
        <p>
          The first experience should feel simple: see what matters, stay organized,
          and make decisions with less noise.
        </p>
      </div>

      <div className="landing-grid">
        {featureCards.map(({ title, description, icon: Icon }) => (
          <article key={title} className="landing-card premium-card-block">
            <span className="landing-card__icon">
              <Icon size={18} />
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
