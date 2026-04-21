export default function TrustSection({ trustHighlights = [], testimonials = [] }) {
  const featuredTestimonial = testimonials[0];

  return (
    <section className="landing-section">
      <div className="landing-section__head">
        <span className="page-kicker">Trust and clarity</span>
        <h2>Enough proof to feel confident without overcrowding the page</h2>
        <p>
          Visitors should quickly understand that KOLski feels organized, credible,
          and worth exploring further.
        </p>
      </div>

      <div className="trust-strip">
        {trustHighlights.map(({ title, text }) => (
          <article key={title} className="trust-chip premium-card-block">
            <strong>{title}</strong>
            <span>{text}</span>
          </article>
        ))}
      </div>

      {featuredTestimonial ? (
        <article className="trust-quote premium-card-block">
          <p>“{featuredTestimonial.quote}”</p>
          <div>
            <strong>{featuredTestimonial.name}</strong>
            <span>{featuredTestimonial.role}</span>
          </div>
        </article>
      ) : null}
    </section>
  );
}
