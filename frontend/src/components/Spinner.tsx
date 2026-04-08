import type { HTMLAttributes } from "react";

type SpinnerSize = "small" | "medium" | "large";

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
}

export function Spinner({ size = "medium", className = "", ...props }: SpinnerProps) {
  return (
    <div
      className={`spinner spinner-${size} ${className}`.trim()}
      data-testid="loading-spinner"
      role="status"
      aria-label="Cargando"
      {...props}
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
