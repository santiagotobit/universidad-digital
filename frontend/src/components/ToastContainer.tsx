import { useToast } from "../hooks/useToast";
import "../styles/toast.css";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
          aria-live="polite"
        >
          <div className="toast-content">
            <span>{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
          <div className="toast-progress" />
        </div>
      ))}
    </div>
  );
}
