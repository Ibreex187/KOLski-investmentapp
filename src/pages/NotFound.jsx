import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="premium-page utility-page">
      <div className="premium-card-block utility-card">
        <div className="utility-icon-wrap">
          <Compass size={30} />
        </div>
        <div className="utility-copy">
          <span className="page-kicker">404</span>
          <h1>Page not found</h1>
          <p>The route you opened does not exist or may have been moved to a different workspace section.</p>
        </div>

        <div className="panel-actions utility-actions">
          <Link to="/dashboard" className="panel-button">
            <Home size={16} />
            <span>Go to dashboard</span>
          </Link>
          <Link to="/market/search" className="panel-button panel-button--secondary">
            <Search size={16} />
            <span>Search stocks</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
