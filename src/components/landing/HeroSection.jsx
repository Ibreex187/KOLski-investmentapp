import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({ reasonsToJoin = [] }) {
  return (
    <div className="landing-hero__copy">
      <span className="page-kicker">Invest smarter with KOLski</span>
      <h1>Your premium command center for modern investing.</h1>
      <p>
        KOLski helps you track your portfolio, monitor markets, manage your watchlist,
        review activity history, and act on opportunities from one intelligent workspace.
      </p>

      <div className="landing-actions">
        <Link to="/register" className="landing-btn landing-btn--primary">
          <span>Create your free account</span>
          <ArrowRight size={18} />
        </Link>

        <Link to="/login" className="landing-btn landing-btn--secondary">
          Sign in
        </Link>
      </div>

      <ul className="landing-points">
        {reasonsToJoin.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
