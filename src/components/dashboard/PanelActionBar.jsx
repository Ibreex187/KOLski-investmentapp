import { Link } from 'react-router-dom';

export default function PanelActionBar({ actions = [] }) {
  return (
    <div className="panel-actions">
      {actions.map((action) => {
        const key = action.key || action.label;
        const className = `panel-button${action.variant === 'secondary' ? ' panel-button--secondary' : ''}${action.variant === 'danger' ? ' panel-button--danger' : ''}`;
        const content = (
          <>
            {action.icon || null}
            <span>{action.label}</span>
          </>
        );

        if (action.to) {
          return (
            <Link key={key} to={action.to} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={key}
            type={action.type || 'button'}
            className={className}
            onClick={action.onClick}
            disabled={Boolean(action.disabled)}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}