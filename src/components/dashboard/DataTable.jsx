import StatusBadge from './StatusBadge';

export default function DataTable({ title, status, rows = [], columns = [], className = '' }) {
  return (
    <div className={`premium-card-block table-panel ${className}`.trim()} role="table" aria-label={title}>
      <div className="panel-head">
        <h2>{title}</h2>
        <StatusBadge {...status} />
      </div>

      <div className="table-shell" role="rowgroup">
        <div className="table-shell__head" style={{ '--table-columns': columns.length }} role="row">
          {columns.map((column) => (
            <span key={column.key} role="columnheader">{column.label || column.key}</span>
          ))}
        </div>

        <div className="holdings-list" role="rowgroup">
          {rows.map((row, index) => (
            <div
              key={row.id || `${title}-${index}`}
              className={`holding-row ${row.rowClassName || ''}`.trim()}
              style={{ '--table-columns': columns.length }}
              role="row"
            >
              {columns.map((column) => {
                const value = row[column.key];
                const cellClassName = typeof column.getClassName === 'function'
                  ? column.getClassName(value, row)
                  : '';
                const content = typeof column.render === 'function'
                  ? column.render(value, row)
                  : value;

                const CellTag = column.emphasis ? 'strong' : 'span';
                return (
                  <div key={column.key} className="holding-cell" data-label={column.label || column.key} role="cell">
                    <span className="holding-cell__label">{column.label || column.key}</span>
                    <CellTag className={cellClassName}>{content}</CellTag>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
