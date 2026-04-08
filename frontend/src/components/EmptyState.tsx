import type { HTMLAttributes } from "react";

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon = "📭",
  action,
  className = "",
  ...props
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`.trim()} {...props}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <button className="button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
