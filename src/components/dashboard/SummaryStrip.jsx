export default function SummaryStrip({ items = [], variant = 'default' }) {
  const stripClassName = variant === 'trade' ? 'trade-overview-strip' : 'funding-summary-grid';
  const cardBaseClassName = variant === 'trade' ? 'trade-overview-card' : 'funding-summary-card';

  return (
    <div className={stripClassName}>
      {items.map((item) => {
        const toneClassName = variant === 'trade' && item.tone
          ? ` ${cardBaseClassName}--${item.tone}`
          : '';

        return (
          <article key={item.label} className={`${cardBaseClassName}${toneClassName}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </article>
        );
      })}
    </div>
  );
}