import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="landing-section">
      <div className="landing-cta premium-card-block">
        <span className="page-kicker">Start now</span>
        <h2>Join KOLski and take control of your investing workflow.</h2>
        <p>
          Create your account to access a cleaner, smarter, and more professional investing
          experience.
        </p>
        <Link to="/register" className="landing-btn landing-btn--primary">
          <span>Get started today</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
