import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <section className="premium-page utility-page">
      <div className="premium-card-block utility-card utility-card--warning">
        <div className="utility-icon-wrap utility-icon-wrap--warning">
          <ShieldAlert size={30} />
        </div>
        <div className="utility-copy">
          <span className="page-kicker">403</span>
          <h1>Unauthorized access</h1>
          <p>You are signed in, but this area requires elevated permissions or a different account role.</p>
        </div>

        <div className="panel-actions utility-actions">
          <Link to="/dashboard" className="panel-button">
            <ArrowLeft size={16} />
            <span>Back to dashboard</span>
          </Link>
          <Link to="/account" className="panel-button panel-button--secondary">
            Review account
          </Link>
        </div>
      </div>
    </section>
  );
}
