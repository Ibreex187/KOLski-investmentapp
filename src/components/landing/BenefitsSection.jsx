export default function BenefitsSection({ gettingStarted = [] }) {
  return (
    <section className="landing-section landing-section--split">
      <article className="premium-card-block landing-copy-block">
        <span className="page-kicker">Why register</span>
        <h2>Give users a real reason to join</h2>
        <p>
          KOLski is not just another finance screen. It is a premium workspace built to help
          users stay organized, act faster, and invest with more confidence.
        </p>
      </article>

      <article className="premium-card-block landing-steps">
        <span className="page-kicker">How it helps</span>
        <ol>
          {gettingStarted.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </article>
    </section>
  );
}
