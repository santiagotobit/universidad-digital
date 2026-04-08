import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="layout-auth">
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1f2937" }}>
            Universidad Digital
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
