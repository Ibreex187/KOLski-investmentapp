import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import Navbar from '../layout/Navbar';
import { landingNavItems, publicNavbarConfig } from '../layout/navbarConfig';

const defaultChips = [
  { label: 'Secure access', icon: ShieldCheck },
  { label: 'Clean workflow', icon: Sparkles },
  { label: 'Premium tools', icon: TrendingUp },
];

export default function AuthShell({
  kicker,
  title,
  description,
  highlights = [],
  formSubtitle,
  footerText,
  footerLinkTo,
  footerLinkLabel,
  children,
}) {
  return (
    <div className="auth-wrapper premium-auth-shell auth-shell-with-nav">
      <div className="auth-shell-frame">
        <Navbar
          {...publicNavbarConfig}
          navItems={landingNavItems}
          marketLabel="Secure account access"
        />

        <section className="auth-showcase" aria-label="Account access layout">
          <div className="auth-copy-card auth-showcase__panel">
            <span className="page-kicker">{kicker}</span>
            <h1>{title}</h1>
            <p>{description}</p>

            <div className="auth-chip-row">
              {defaultChips.map(({ label, icon: Icon }) => (
                <span key={label} className="auth-chip">
                  <Icon size={14} />
                  <span>{label}</span>
                </span>
              ))}
            </div>

            <div className="auth-feature-list">
              {highlights.map((item) => (
                <div key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-form-rail">
            <div className="auth-card premium-auth-card">
              <div className="text-center mb-4">
                <div className="auth-logo d-flex align-items-center justify-content-center gap-2">
                  <TrendingUp size={28} />
                  <span>KOLski</span>
                </div>
                <p className="text-muted mt-2 mb-0 auth-subcopy">{formSubtitle}</p>
              </div>

              {children}

              <hr className="divider" />

              <p className="text-center text-muted mb-0 auth-footer-copy">
                {footerText}{' '}
                <Link to={footerLinkTo} className="text-primary text-decoration-none fw-semibold">
                  {footerLinkLabel}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
