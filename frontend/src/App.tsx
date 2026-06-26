import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import "./App.css";

import OffersPage from "./pages/OffersPage";
import OfferDetailPage from "./pages/OfferDetailPage";
import OfferCreatePage from "./pages/OfferCreatePage";
import BookingsPage from "./pages/BookingsPage";
import LoginPage from "./pages/LoginPage";
import BookingsLookupPage from "./pages/BookingsLookupPage";
import OffersLookupPage from "./pages/OffersLookupPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProvidersPage from "./pages/ProvidersPage";
import RegisterPage from "./pages/RegisterPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import Modal from "./components/Modal";
import { ConfirmProvider } from "./components/ConfirmProvider";
import { ToastProvider } from "./components/ToastProvider";
import { useToast } from "./components/useToast";

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link is-active" : "nav-link";
}

function Nav() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [denyOpen, setDenyOpen] = useState(false);
  const [denyMsg, setDenyMsg] = useState("Lo siento, no tienes permiso.");
  const [mobileOpen, setMobileOpen] = useState(false);

  type Role = "admin" | "provider" | "staff" | "client";
  const can = (roles?: Role[]) => {
    if (!roles || roles.length === 0) return true;
    if (!user) return false;
    return roles.includes(user.role);
  };
  const guardNav = (e: React.MouseEvent, to: string, roles?: Role[]) => {
    if (!can(roles)) {
      e.preventDefault();
      const message = user
        ? "Lo siento, no tienes permiso para acceder a esta función."
        : "Necesitas iniciar sesión para acceder a esta función.";
      setDenyMsg(message);
      showToast({
        tone: user ? "warning" : "danger",
        title: user ? "Acceso restringido" : "Inicia sesión",
        message,
      });
      setDenyOpen(true);
      return;
    }
    e.preventDefault();
    setMobileOpen(false);
    navigate(to);
  };

  const handleLogin = () => {
    setDenyOpen(false);
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    showToast({
      tone: "success",
      title: "Sesión cerrada",
      message: "Has salido de Hamari correctamente.",
    });
  };

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(14, 11, 22, 0.8)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div className="container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
      }}>
        <Link to="/" style={{
          fontWeight: 900,
          fontSize: 24,
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.02em",
          textDecoration: "none",
        }}>
          <span className="grad-text">Hamari</span>
        </Link>

        <nav className="desktop-nav">
          <a href="#" className="nav-link" onClick={(e) => guardNav(e, "/offers", ["admin","provider","staff","client"])}>Ofertas</a>

          {(user?.role === "provider" || user?.role === "admin") && (
            <NavLink to="/offers/new" className={navClass}>Crear oferta</NavLink>
          )}

          {(user?.role === "provider" || user?.role === "admin") && (
            <NavLink to="/offers/lookup" className={navClass}>
              {user?.role === "provider" ? "Mis ofertas" : "Consultar ofertas"}
            </NavLink>
          )}

          {(user?.role === "staff" || user?.role === "admin") && (
            <NavLink to="/bookings/lookup" className={navClass}>Consultar reservas</NavLink>
          )}

          {(!user || user?.role === "client") && (
            <a href="#" className="nav-link" onClick={(e) => guardNav(e, "/bookings", ["client"])}>Mis reservas</a>
          )}

          {user?.role === "admin" && (
            <NavLink to="/admin/users" className={navClass}>Gestionar usuarios</NavLink>
          )}

          <NavLink to="/providers" className={navClass}>Proveedores</NavLink>
          <NavLink to="/about" className={navClass}>Sobre nosotros</NavLink>

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />

          {!user ? (
            <>
              <NavLink to="/register" className={navClass}>Registrarse</NavLink>
              <Link to="/login" style={{
                background: "var(--grad-brand)",
                color: "#fff",
                padding: "8px 18px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
                transition: "all 0.25s ease",
              }}>Login</Link>
            </>
          ) : (
            <>
              <span className="user-pill" title={`Sesión activa como ${user.username}`}>
                {user.role}
              </span>
              <button className="btn-danger" onClick={handleLogout} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                Salir
              </button>
            </>
          )}
        </nav>

        <button
          className="mobile-nav-toggle"
          type="button"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileOpen(false)}>
          <nav className="mobile-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-drawer-head">
              <span className="grad-text">Hamari</span>
              {user && <span className="user-pill">{user.role}</span>}
            </div>

            <a href="#" className="nav-link" onClick={(e) => guardNav(e, "/offers", ["admin","provider","staff","client"])}>Ofertas</a>
            {(user?.role === "provider" || user?.role === "admin") && <NavLink to="/offers/new" className={navClass} onClick={() => setMobileOpen(false)}>Crear oferta</NavLink>}
            {(user?.role === "provider" || user?.role === "admin") && <NavLink to="/offers/lookup" className={navClass} onClick={() => setMobileOpen(false)}>{user?.role === "provider" ? "Mis ofertas" : "Consultar ofertas"}</NavLink>}
            {(user?.role === "staff" || user?.role === "admin") && <NavLink to="/bookings/lookup" className={navClass} onClick={() => setMobileOpen(false)}>Consultar reservas</NavLink>}
            {(!user || user?.role === "client") && <a href="#" className="nav-link" onClick={(e) => guardNav(e, "/bookings", ["client"])}>Mis reservas</a>}
            {user?.role === "admin" && <NavLink to="/admin/users" className={navClass} onClick={() => setMobileOpen(false)}>Gestionar usuarios</NavLink>}
            <NavLink to="/providers" className={navClass} onClick={() => setMobileOpen(false)}>Proveedores</NavLink>
            <NavLink to="/about" className={navClass} onClick={() => setMobileOpen(false)}>Sobre nosotros</NavLink>

            <div className="divider" />

            {!user ? (
              <>
                <NavLink to="/register" className={navClass} onClick={() => setMobileOpen(false)}>Registrarse</NavLink>
                <Link to="/login" className="btn-primary" style={{ textAlign: "center", padding: "12px 18px", textDecoration: "none" }} onClick={() => setMobileOpen(false)}>Login</Link>
              </>
            ) : (
              <button className="btn-danger" onClick={handleLogout}>Salir</button>
            )}
          </nav>
        </div>
      )}
      <Modal
        open={denyOpen}
        onClose={() => setDenyOpen(false)}
        title="Permiso requerido"
        showLogin={!user}
        onLogin={handleLogin}
      >
        {denyMsg}
      </Modal>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{
      marginTop: "auto",
      borderTop: "1px solid rgba(255,255,255,0.04)",
      background: "rgba(14, 11, 22, 0.6)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}>
      <div className="container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 0",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div>
          <span className="grad-text" style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-display)" }}>
            Hamari
          </span>
          <p style={{ color: "var(--color-text-dim)", fontSize: "0.85rem", margin: "4px 0 0" }}>
            Experiencias inolvidables en Málaga
          </p>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <Link to="/about" className="nav-link" style={{ fontSize: "0.85rem" }}>Sobre nosotros</Link>
          <Link to="/providers" className="nav-link" style={{ fontSize: "0.85rem" }}>Proveedores</Link>
          <Link to="/offers" className="nav-link" style={{ fontSize: "0.85rem" }}>Ofertas</Link>
        </div>
        <p style={{ color: "var(--color-text-dim)", fontSize: "0.8rem", margin: 0 }}>
          &copy; 2025 Hamari. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Nav />
            <main>
              <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route path="/admin/users" element={
              <ProtectedRoute roles={["admin"]}><AdminUsersPage /></ProtectedRoute>
            } />
            <Route path="/offers" element={
              <ProtectedRoute roles={["admin","provider","staff","client"]}><OffersPage /></ProtectedRoute>
            } />
            <Route path="/offers/:id" element={
              <ProtectedRoute roles={["admin","provider","staff","client"]}><OfferDetailPage /></ProtectedRoute>
            } />
            <Route path="/offers/new" element={
              <ProtectedRoute roles={["admin","provider"]}><OfferCreatePage /></ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute roles={["client"]}><BookingsPage /></ProtectedRoute>
            } />
            <Route path="/bookings/lookup" element={
              <ProtectedRoute roles={["staff","admin"]}><BookingsLookupPage /></ProtectedRoute>
            } />
            <Route path="/offers/lookup" element={
              <ProtectedRoute roles={["provider","admin"]}><OffersLookupPage /></ProtectedRoute>
            } />

            <Route path="*" element={
              <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
                <h1 className="grad-text" style={{ fontSize: "4rem", marginBottom: 16 }}>404</h1>
                <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>Página no encontrada</p>
                <Link to="/" className="btn-primary" style={{ display: "inline-block", marginTop: 24, padding: "12px 28px", textDecoration: "none" }}>
                  Volver al inicio
                </Link>
              </div>
            } />
              </Routes>
            </main>
            <Footer />
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
