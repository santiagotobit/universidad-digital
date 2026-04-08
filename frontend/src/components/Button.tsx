import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const variantClass =
    variant === "secondary" ? "secondary" : variant === "danger" ? "danger" : variant === "success" ? "success" : "";
  return <button className={`button ${variantClass} ${className}`.trim()} {...props} />;
}
