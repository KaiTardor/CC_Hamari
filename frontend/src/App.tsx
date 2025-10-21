import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import OffersPage from "./pages/OffersPage";
import OfferDetailPage from "./pages/OfferDetailPage";
import OfferCreatePage from "./pages/OfferCreatePage";
import BookingsPage from "./pages/BookingsPage";
import LoginPage from "./pages/LoginPage";
import StaffLookupPage from "./pages/StaffLookupPage";
import HomePage from "./pages/HomePage";
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
      setDenyMsg("Lo siento, no tienes permiso para acceder a esta función.");
      setDenyOpen(true);
      return;
    }
    e.preventDefault();
    navigate(to);
  };

  return (
    <header style={{ borderBottom: "2px solid #ff2d75", background: "#3a3348", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
        <Link to="/" className="link" style={{ fontWeight: 800, fontSize: 22, background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Hamari</Link>
        <nav className="nav" style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="#" className="link" onClick={(e) => guardNav(e, "/offers", ["admin","provider","staff"])}>Ofertas</a>
          <a href="#" className="link" onClick={(e) => guardNav(e, "/offers/new", ["admin","provider"])}>Crear oferta</a>
          <a href="#" className="link" onClick={(e) => guardNav(e, "/bookings", ["client","admin"])}>Mis reservas</a>
          <a href="#" className="link" onClick={(e) => guardNav(e, "/staff/lookup", ["staff","admin"])}>Consultar ofertas</a>
          {!user ? (
            <Link to="/login" className="link">Login</Link>
          ) : (
            <button className="btn" onClick={logout}>Salir ({user.role})</button>
          )}
        </nav>
      </div>
      <Modal open={denyOpen} onClose={() => setDenyOpen(false)} title="Permiso requerido">
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
            {/* Listado de ofertas */}
            <Route
              path="/offers"
              element={
                <ProtectedRoute roles={["admin","provider","staff"]}>
                  <OffersPage />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<LoginPage />} />

            {/* Detalle oferta: visible a admin/provider/staff */}
            <Route
              path="/offers/:id"
              element={
                <ProtectedRoute roles={["admin","provider","staff"]}>
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

            {/* Mis reservas: client y admin (admin tiene todo) */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute roles={["client","admin"]}>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />

            {/* Staff lookup */}
            <Route
              path="/staff/lookup"
              element={
                <ProtectedRoute roles={["staff","admin"]}>
                  <StaffLookupPage />
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
