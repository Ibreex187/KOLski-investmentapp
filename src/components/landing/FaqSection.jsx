export default function FaqSection({ faqItems = [] }) {
  return (
    <section className="landing-section">
      <div className="landing-section__head">
        <span className="page-kicker">FAQ</span>
        <h2>Only the questions that matter before getting started</h2>
      </div>

      <div className="faq-list">
        {faqItems.map(({ question, answer }) => (
          <details key={question} className="faq-item premium-card-block">
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
