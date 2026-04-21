import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingSection({ pricingPlans = [] }) {
  return (
    <section className="landing-section">
      <div className="landing-section__head">
        <span className="page-kicker">Simple access</span>
        <h2>Pick the experience that fits your investing workflow</h2>
        <p>
          Keep the pricing area clean, premium, and easy to scan so visitors know where to
          start.
        </p>
      </div>

      <div className="pricing-grid">
        {pricingPlans.map(({ name, price, description, features, highlighted, badge }) => (
          <article
            key={name}
            className={`pricing-card premium-card-block ${highlighted ? 'pricing-card--featured' : ''}`}
          >
            {badge ? <span className="pricing-badge">{badge}</span> : null}
            <h3>{name}</h3>
            <strong>{price}</strong>
            <p>{description}</p>

            <ul className="pricing-features">
              {features.map((feature) => (
                <li key={feature}>
                  <Check size={16} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/register" className="landing-btn landing-btn--primary">
              <span>Get started</span>
              <ArrowRight size={18} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
