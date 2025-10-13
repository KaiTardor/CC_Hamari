import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import OffersPage from "./pages/OffersPage";
import OfferDetailPage from "./pages/OfferDetailPage";
import OfferCreatePage from "./pages/OfferCreatePage";
import BookingsPage from "./pages/BookingsPage";
import LoginPage from "./pages/LoginPage";
import StaffLookupPage from "./pages/StaffLookupPage";

function Nav() {
  const { user, logout } = useAuth();
  return (
    <header style={{ borderBottom: "1px solid #eee" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" className="link" style={{ fontWeight: 700 }}>Hamari</Link>
        <nav className="nav">
          {/* VISIBILIDAD por rol */}
          {(user?.role === "admin" || user?.role === "provider" || user?.role === "staff") && (
            <Link to="/" className="link">Ofertas</Link>
          )}
          {(user?.role === "admin" || user?.role === "provider") && (
            <Link to="/offers/new" className="link">Crear oferta</Link>
          )}
          {(user?.role === "client" || user?.role === "admin") && (
            <Link to="/bookings" className="link">Mis reservas</Link>
          )}
          {(user?.role === "staff" || user?.role === "admin") && (
            <Link to="/staff/lookup" className="link">Consulta ofertas</Link>
          )}

          {!user ? (
            <Link to="/login" className="link">Login</Link>
          ) : (
            <button className="btn" onClick={logout}>Salir ({user.role})</button>
          )}
        </nav>
      </div>
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
            {/* Home: según rol */}
            <Route
              path="/"
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
