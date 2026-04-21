export default function TestimonialsSection({ testimonials = [] }) {
  return (
    <section className="landing-section">
      <div className="landing-section__head">
        <span className="page-kicker">What people want from it</span>
        <h2>A product experience that feels credible from the first visit</h2>
        <p>
          Strong landing pages work better when visitors can picture how the platform helps
          real users stay organized and confident.
        </p>
      </div>

      <div className="testimonial-grid">
        {testimonials.map(({ quote, name, role }) => (
          <article key={`${name}-${role}`} className="testimonial-card premium-card-block">
            <p>“{quote}”</p>
            <div className="testimonial-meta">
              <strong>{name}</strong>
              <span>{role}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
