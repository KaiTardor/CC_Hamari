import type { Offer } from "../api";

export default function OfferCard({ offer }: { offer: Offer }) {
  const image = offer.images?.[0] || "/placeholder-offer.jpg";

  return (
    <div
      className="card"
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={image}
          alt={offer.title}
          style={{
            width: "100%",
            height: 200,
            objectFit: "cover",
            display: "block",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, transparent 40%, rgba(14,11,22,0.8) 100%)",
        }} />
        {/* Price tag */}
        <div style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "rgba(14,11,22,0.7)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: "var(--radius-sm)",
          padding: "6px 12px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <span style={{
            color: "var(--color-orange)",
            fontWeight: 700,
            fontSize: "1.05rem",
            fontFamily: "var(--font-display)",
          }}>
            {offer.price.toFixed(2)} €
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          margin: "0 0 10px",
          color: "var(--color-text-light)",
          fontSize: "1.15rem",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          lineHeight: 1.3,
        }}>
          {offer.title}
        </h3>

        <p style={{
          color: "var(--color-text-muted)",
          fontSize: "0.9rem",
          lineHeight: 1.6,
          marginBottom: 16,
          flex: 1,
        }}>
          {offer.description.length > 110
            ? offer.description.slice(0, 110) + "…"
            : offer.description}
        </p>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}>
          <span className="badge badge-cyan" style={{ fontSize: "0.78rem" }}>
            {offer.available_from} → {offer.available_to}
          </span>
          <span style={{
            fontSize: "0.82rem",
            color: "var(--color-text-dim)",
          }}>
            Cap: {offer.daily_capacity}/día
          </span>
        </div>

        <a
          href={`/offers/${offer._id}`}
          className="btn-primary"
          style={{
            display: "block",
            textAlign: "center",
            padding: "10px 16px",
            borderRadius: "var(--radius-sm)",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          Ver oferta
        </a>
      </div>
    </div>
  );
}
