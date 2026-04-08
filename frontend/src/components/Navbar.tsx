import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ConfirmDialog } from "./ConfirmDialog";
import "../styles/navbar.css";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const getRoleLabel = () => {
    if (user?.roles.includes("Administrador")) return "Administrador";
    if (user?.roles.includes("Docente")) return "Docente";
    return "Estudiante";
  };

  return (
    <>
      <nav className="navbar" data-testid="navigation-menu">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <span className="navbar-brand-icon">🎓</span>
            <span className="navbar-brand-text">Universidad Digital</span>
          </Link>

          <button
            className="navbar-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
            {user && (
              <>
                <div className="navbar-user" data-testid="user-greeting">
                  <span className="navbar-user-avatar">{user.email[0].toUpperCase()}</span>
                  <div className="navbar-user-info">
                    <div className="navbar-user-name">{user.email}</div>
                    <div className="navbar-user-role">{getRoleLabel()}</div>
                  </div>
                </div>

                <button
                  className="button button-logout"
                  onClick={() => setShowLogoutConfirm(true)}
                  data-testid="logout-button"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
