import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

type Option = {
  value: string | number;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Option[];
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, error, id, ...props },
  ref
) {
  const selectId = id ?? props.name ?? label.replace(/\s+/g, "-").toLowerCase();
  const describedBy = error ? `${selectId}-error` : undefined;

  return (
    <div>
      <label htmlFor={selectId}>{label}</label>
      <select
        id={selectId}
        className="select"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        ref={ref}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <div id={`${selectId}-error`} role="alert" className="alert error">
          {error}
        </div>
      ) : null}
    </div>
  );
});
