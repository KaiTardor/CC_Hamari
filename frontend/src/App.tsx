import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import OffersPage from "./pages/OffersPage";
import OfferDetailPage from "./pages/OfferDetailPage";
import OfferCreatePage from "./pages/OfferCreatePage";
import BookingsPage from "./pages/BookingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <header style={{ borderBottom: "1px solid #eee" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/" className="link" style={{ fontWeight: 700 }}>Hamari</Link>
          <nav className="nav">
            <Link to="/" className="link">Ofertas</Link>
            <Link to="/offers/new" className="link">Crear oferta</Link>
            <Link to="/bookings" className="link">Mis reservas</Link>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<OffersPage />} />
          <Route path="/offers/:id" element={<OfferDetailPage />} />
          <Route path="/offers/new" element={<OfferCreatePage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="*" element={<div className="container">No encontrado</div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
