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
    <div className="container" style={{ padding: "32px 0", textAlign: "center" }}>
      <div style={{ color: "var(--color-text-muted)" }}>Cargando…</div>
    </div>
  );

  return (
    <div className="container" style={{ padding: "32px 0", maxWidth: 800 }}>
      <div style={{
        background: "var(--color-bg-card)",
        borderRadius: 16,
        padding: 32,
        border: "2px solid rgba(255, 45, 117, 0.3)",
      }}>
        <h1 style={{
          background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 16,
          fontSize: "2rem",
        }}>
          {offer.title}
        </h1>
        
        <p style={{ 
          color: "var(--color-text-muted)", 
          lineHeight: 1.7, 
          marginBottom: 24,
          fontSize: "1.05rem",
        }}>
          {offer.description}
        </p>

        <div style={{ 
          display: "grid", 
          gap: 16, 
          marginBottom: 32,
          background: "rgba(255, 45, 117, 0.05)",
          padding: 20,
          borderRadius: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ 
              fontSize: "1.5rem",
              background: "linear-gradient(135deg, var(--color-magenta), var(--color-orange))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 700,
            }}>
              💰
            </span>
            <div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Precio</div>
              <div style={{ color: "var(--color-orange)", fontSize: "1.4rem", fontWeight: 700 }}>
                {offer.price.toFixed(2)} €
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.5rem" }}>📅</span>
            <div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Disponibilidad</div>
              <div style={{ color: "var(--color-cyan)", fontWeight: 600 }}>
                {offer.available_from} → {offer.available_to}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.5rem" }}>👥</span>
            <div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Capacidad por día</div>
              <div style={{ color: "var(--color-text-light)", fontWeight: 600 }}>
                {offer.daily_capacity} {offer.daily_capacity === 1 ? "reserva" : "reservas"}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            padding: "14px 24px",
            fontSize: "1.2rem",
            fontWeight: 700,
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
