import StatusBadge from './StatusBadge';

export default function StatusList({ items = [] }) {
  return (
    <ul className="insight-list insight-list--status">
      {items.map((item) => (
        <li key={item.text}>
          <span>{item.text}</span>
          <StatusBadge {...item.status} />
        </li>
      ))}
    </ul>
  );
}
