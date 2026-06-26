import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchOffer, type Offer } from "../api";
import BookingModal from "../components/BookingModal";
import { useAuth } from "../auth/AuthContext";

export default function OfferDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (id) fetchOffer(id).then(setOffer).catch(() => setOffer(null));
  }, [id]);

  if (!offer) return (
    <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
      <div className="skeleton" style={{ width: 200, height: 28, margin: "0 auto 16px", borderRadius: 4 }} />
      <div className="skeleton" style={{ width: 300, height: 16, margin: "0 auto", borderRadius: 4 }} />
    </div>
  );

  return (
    <div className="container" style={{ padding: "40px 0", maxWidth: 800 }}>
      <div className="card anim-fade-in-up" style={{ padding: 36 }}>
        <h1 className="grad-text" style={{
          marginBottom: 20,
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontFamily: "var(--font-display)",
        }}>
          {offer.title}
        </h1>

        <p style={{
          color: "var(--color-text-muted)",
          lineHeight: 1.8,
          marginBottom: 32,
          fontSize: "1.05rem",
        }}>
          {offer.description}
        </p>

        <div style={{
          display: "grid",
          gap: 16,
          marginBottom: 32,
          background: "rgba(255, 45, 117, 0.04)",
          padding: 24,
          borderRadius: "var(--radius-md)",
          border: "1px solid rgba(255,45,117,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: "1.5rem" }}>💰</span>
            <div>
              <div style={{ color: "var(--color-text-dim)", fontSize: "0.82rem", marginBottom: 2 }}>Precio</div>
              <div style={{ color: "var(--color-orange)", fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
                {offer.price.toFixed(2)} €
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: "1.5rem" }}>📅</span>
            <div>
              <div style={{ color: "var(--color-text-dim)", fontSize: "0.82rem", marginBottom: 2 }}>Disponibilidad</div>
              <div className="badge badge-cyan">
                {offer.available_from} → {offer.available_to}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: "1.5rem" }}>👥</span>
            <div>
              <div style={{ color: "var(--color-text-dim)", fontSize: "0.82rem", marginBottom: 2 }}>Capacidad por día</div>
              <div style={{ color: "var(--color-text-light)", fontWeight: 600 }}>
                {offer.daily_capacity} {offer.daily_capacity === 1 ? "reserva" : "reservas"}
              </div>
            </div>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            padding: "16px 24px",
            fontSize: "1.15rem",
            fontWeight: 700,
            fontFamily: "var(--font-display)",
          }}
        >
          Reservar Ahora
        </button>
      </div>

      {open && (
        <BookingModal
          offerId={offer._id}
          onClose={() => setOpen(false)}
          clientDniDefault={user?.ref_dni}
        />
      )}
    </div>
  );
}
