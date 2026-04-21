export default function FilterPillGroup({ options = [], value, onChange }) {
  return (
    <div className="funding-quick-filters">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`filter-pill ${value === option.value ? 'is-active' : ''}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}