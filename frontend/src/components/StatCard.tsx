import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: string | ReactNode;
  color?: "primary" | "success" | "warning" | "info";
  trend?: "positive" | "negative";
}

export function StatCard({
  title,
  value,
  icon,
  color = "primary",
  trend,
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
        {trend && (
          <div className={`stat-trend ${trend === "positive" ? "positive" : "negative"}`}>
            <span>{trend === "positive" ? "↑" : "↓"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
