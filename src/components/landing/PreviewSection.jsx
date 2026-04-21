import { useEffect, useState } from 'react';

export default function PreviewSection({ previewTabs = [] }) {
  const [activePreview, setActivePreview] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(previewTabs[0]?.counter?.value || 0);

  useEffect(() => {
    if (!previewTabs.length) return undefined;

    const cycle = window.setInterval(() => {
      setActivePreview((prev) => (prev + 1) % previewTabs.length);
    }, 3200);

    return () => window.clearInterval(cycle);
  }, [previewTabs]);

  useEffect(() => {
    if (!previewTabs.length) return undefined;

    const target = previewTabs[activePreview].counter.value;
    let frame = 0;
    const totalFrames = 24;

    setAnimatedValue(0);

    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      setAnimatedValue(Math.round(target * progress));

      if (progress === 1) {
        window.clearInterval(timer);
      }
    }, 24);

    return () => window.clearInterval(timer);
  }, [activePreview, previewTabs]);

  if (!previewTabs.length) return null;

  const currentPreview = previewTabs[activePreview];
  const formattedPreviewValue = `${currentPreview.counter.prefix || ''}${animatedValue.toLocaleString()}${currentPreview.counter.suffix || ''}`;

  return (
    <div className="landing-hero__panel">
      <div className="landing-preview premium-card-block">
        <span className="page-kicker">Live preview</span>
        <h2>See how KOLski feels in action</h2>
        <p>
          Give visitors a glimpse of the premium investment experience they unlock after
          signup.
        </p>

        <div className="mock-tabs" role="tablist" aria-label="Preview tabs">
          {previewTabs.map((tab, index) => (
            <button
              key={tab.key}
              type="button"
              className={`mock-tab ${activePreview === index ? 'is-active' : ''}`}
              onClick={() => setActivePreview(index)}
              onMouseEnter={() => setActivePreview(index)}
              data-tooltip={tab.tooltip}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="landing-dashboard-mock interactive-mock-card">
          <div className="mock-glow-orb mock-glow-orb--one" aria-hidden="true" />
          <div className="mock-glow-orb mock-glow-orb--two" aria-hidden="true" />

          <div className="mock-topbar">
            {currentPreview.badges.map((badge) => (
              <span
                key={badge.text}
                className={`mock-pill ${badge.tone === 'blue' ? 'mock-pill--blue' : ''} has-tooltip`}
                data-tooltip={badge.tooltip}
              >
                {badge.text}
              </span>
            ))}
          </div>

          <div className="mock-balance-card floating-panel">
            <span>{currentPreview.metricLabel}</span>
            <strong>{formattedPreviewValue}</strong>
            <small>{currentPreview.trend}</small>
          </div>

          <div className="mock-chart-bars">
            {currentPreview.bars.map((height, index) => (
              <span key={`${currentPreview.key}-${index}`} style={{ height: `${height}%` }} />
            ))}
          </div>

          <div className="mock-mini-grid">
            {currentPreview.cards.map((card) => (
              <div key={card.title} className="floating-panel has-tooltip" data-tooltip={card.text}>
                <strong>{card.title}</strong>
                <span>{card.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="landing-preview__hint">Hover or tap the tabs to explore the product flow.</p>

        <div className="landing-preview__stack">
          <div>
            <strong>All-in-one view</strong>
            <span>Everything important in one premium interface.</span>
          </div>
          <div>
            <strong>Better focus</strong>
            <span>Less noise, more visibility into real decisions.</span>
          </div>
          <div>
            <strong>Growth-ready</strong>
            <span>Designed to scale with live backend data and analytics.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
