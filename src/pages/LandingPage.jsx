import Navbar from '../components/layout/Navbar';
import { landingNavItems, publicNavbarConfig } from '../components/layout/navbarConfig';
import HeroSection from '../components/landing/HeroSection';
import PreviewSection from '../components/landing/PreviewSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import TrustSection from '../components/landing/TrustSection';
import FaqSection from '../components/landing/FaqSection';
import CtaSection from '../components/landing/CtaSection';
import FooterSection from '../components/landing/FooterSection';
import RevealSection from '../components/landing/RevealSection';
import {
  faqItems,
  featureCards,
  footerLinks,
  previewTabs,
  reasonsToJoin,
  testimonials,
  trustHighlights,
} from '../content/landingContent';

export default function LandingPage() {
  return (
    <div className="landing-shell premium-auth-shell auth-shell-with-nav">
      <Navbar
        {...publicNavbarConfig}
        navItems={landingNavItems}
        marketLabel="Built for modern investors"
      />

      <main className="landing-content">
        <RevealSection className="landing-hero premium-card-block" as="section">
          <HeroSection reasonsToJoin={reasonsToJoin} />
          <PreviewSection previewTabs={previewTabs} />
        </RevealSection>

        <RevealSection>
          <FeaturesSection featureCards={featureCards.slice(0, 3)} />
        </RevealSection>

        <RevealSection>
          <TrustSection
            trustHighlights={trustHighlights}
            testimonials={testimonials.slice(0, 1)}
          />
        </RevealSection>

        <RevealSection>
          <FaqSection faqItems={faqItems.slice(0, 3)} />
        </RevealSection>

        <RevealSection>
          <CtaSection />
        </RevealSection>

        <RevealSection>
          <FooterSection footerLinks={footerLinks} />
        </RevealSection>
      </main>
    </div>
  );
}
