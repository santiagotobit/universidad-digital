type AlertType = "error" | "success" | "warning" | "info";

interface AlertProps {
  message?: string;
  type?: AlertType;
  title?: string;
  onClose?: () => void;
}

const iconMap: Record<AlertType, string> = {
  error: "❌",
  success: "✅",
  warning: "⚠️",
  info: "ℹ️",
};

export function Alert({ message, type = "error", title, onClose }: AlertProps) {
  return (
    <div
      className={`alert alert-${type}`}
      role="alert"
      aria-live="polite"
      data-testid={type === "error" ? "error-message" : undefined}
    >
      <div className="alert-icon">{iconMap[type]}</div>
      <div className="alert-content">
        {title && <strong>{title}</strong>}
        {message && <p>{message}</p>}
      </div>
      {onClose && (
        <button
          className="alert-close"
          onClick={onClose}
          aria-label="Cerrar alerta"
        >
          ✕
        </button>
      )}
    </div>
  );
}
