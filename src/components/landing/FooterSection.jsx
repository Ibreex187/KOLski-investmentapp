import { Link } from 'react-router-dom';

export default function FooterSection({ footerLinks = [] }) {
  return (
    <footer className="landing-footer premium-card-block">
      <div className="landing-footer__brand">
        <span className="page-kicker">KOLski</span>
        <h2>Invest smarter with a clearer, more premium workflow.</h2>
        <p>
          Built for users who want a modern investing workspace that feels focused,
          polished, and ready to grow.
        </p>
      </div>

      <div className="landing-footer__links">
        {footerLinks.map((group) => (
          <div key={group.title} className="landing-footer__group">
            <strong>{group.title}</strong>
            <div>
              {group.links.map((link) => (
                <Link key={link.label} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
