export default function DetailList({ items = [], highlighted = false }) {
  const className = highlighted ? 'detail-list detail-list--highlight' : 'detail-list';

  return (
    <div className={className}>
      {items.map((item) => (
        <div key={item.label} className="detail-list__item">
          <span>{item.label}</span>
          {typeof item.value === 'string' || typeof item.value === 'number' ? (
            <strong>{item.value}</strong>
          ) : (
            item.value
          )}
        </div>
      ))}
    </div>
  );
}