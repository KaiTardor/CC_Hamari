import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

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

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [denyOpen, setDenyOpen] = useState(false);
  const [denyMsg, setDenyMsg] = useState("Lo siento, no tienes permiso.");

  type Role = "admin" | "provider" | "staff" | "client";
  const can = (roles?: Role[]) => {
    if (!roles || roles.length === 0) return true; // público
    if (!user) return false;
    return roles.includes(user.role);
  };
  const guardNav = (e: React.MouseEvent, to: string, roles?: Role[]) => {
    if (!can(roles)) {
      e.preventDefault();
      setDenyMsg(user 
        ? "Lo siento, no tienes permiso para acceder a esta función." 
        : "Necesitas iniciar sesión para acceder a esta función.");
      setDenyOpen(true);
      return;
    }
    e.preventDefault();
    navigate(to);
  };

  const handleLogin = () => {
    setDenyOpen(false);
    navigate("/login");
  };

  return (
    <header style={{ borderBottom: "2px solid #ff2d75", background: "#3a3348", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
        <Link to="/" className="link" style={{ fontWeight: 800, fontSize: 22, background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Hamari</Link>
        <nav className="nav" style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {/* Ofertas - siempre visible */}
          <a href="#" className="link" onClick={(e) => guardNav(e, "/offers", ["admin","provider","staff","client"])}>Ofertas</a>
          
          {/* Crear oferta - solo provider y admin */}
          {(user?.role === "provider" || user?.role === "admin") && (
            <Link to="/offers/new" className="link">Crear oferta</Link>
          )}
          
          {/* Consultar ofertas (del proveedor) - solo provider y admin */}
          {(user?.role === "provider" || user?.role === "admin") && (
            <Link to="/offers/lookup" className="link">
              {user?.role === "provider" ? "Mis ofertas" : "Consultar ofertas"}
            </Link>
          )}
          
          {/* Consultar reservas - solo staff y admin */}
          {(user?.role === "staff" || user?.role === "admin") && (
            <Link to="/bookings/lookup" className="link">Consultar reservas</Link>
          )}
          
          {/* Mis reservas - solo para no identificados y client (admin usa Consultar reservas) */}
          {(!user || user?.role === "client") && (
            <a href="#" className="link" onClick={(e) => guardNav(e, "/bookings", ["client"])}>Mis reservas</a>
          )}
          
          {/* Gestionar usuarios - solo admin */}
          {user?.role === "admin" && (
            <Link to="/admin/users" className="link">Gestionar usuarios</Link>
          )}
          
          {/* Proveedores */}
          <Link to="/providers" className="link">Proveedores</Link>
          
          {/* Sobre nosotros */}
          <Link to="/about" className="link">Sobre nosotros</Link>
          
          {/* Login/Register o Salir */}
          {!user ? (
            <>
              <Link to="/register" className="link">Registrarse</Link>
              <Link to="/login" className="link">Login</Link>
            </>
          ) : (
            <button className="btn" onClick={logout}>Salir ({user.role})</button>
          )}
        </nav>
      </div>
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <main>
          <Routes>
            {/* Home público con carrusel */}
            <Route path="/" element={<HomePage />} />
            
            {/* Páginas públicas */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/login" element={<LoginPage />} />

            {/* Admin: gestión de usuarios */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            {/* Listado de ofertas */}
            <Route
              path="/offers"
              element={
                <ProtectedRoute roles={["admin","provider","staff","client"]}>
                  <OffersPage />
                </ProtectedRoute>
              }
            />

            {/* Detalle oferta: visible a todos los usuarios autenticados */}
            <Route
              path="/offers/:id"
              element={
                <ProtectedRoute roles={["admin","provider","staff","client"]}>
                  <OfferDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Crear oferta: admin y provider */}
            <Route
              path="/offers/new"
              element={
                <ProtectedRoute roles={["admin","provider"]}>
                  <OfferCreatePage />
                </ProtectedRoute>
              }
            />

            {/* Mis reservas: client */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute roles={["client"]}>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />

            {/* Consultar reservas: staff y admin */}
            <Route
              path="/bookings/lookup"
              element={
                <ProtectedRoute roles={["staff","admin"]}>
                  <BookingsLookupPage />
                </ProtectedRoute>
              }
            />

            {/* Consultar ofertas por proveedor: provider y admin */}
            <Route
              path="/offers/lookup"
              element={
                <ProtectedRoute roles={["provider","admin"]}>
                  <OffersLookupPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<div className="container">Página no encontrada</div>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
