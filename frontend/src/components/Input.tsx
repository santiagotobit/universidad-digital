import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, ...props },
  ref
) {
  const inputId = id ?? props.name ?? label.replace(/\s+/g, "-").toLowerCase();
  const describedBy = error ? `${inputId}-error` : undefined;

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className="input"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        ref={ref}
        {...props}
      />
      {error ? (
        <div id={`${inputId}-error`} role="alert" className="alert error">
          {error}
        </div>
      ) : null}
    </div>
  );
});
