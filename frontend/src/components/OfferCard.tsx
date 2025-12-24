import type { Offer } from "../api";

export default function OfferCard({ offer }: { offer: Offer }) {
  const image =
    offer.images?.[0] || "/placeholder-offer.jpg";

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        borderRadius: 14,
        overflow: "hidden",
        border: "2px solid rgba(255, 45, 117, 0.25)",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow =
          "0 10px 24px rgba(255, 45, 117, 0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Imagen */}
      <img
        src={image}
        alt={offer.title}
        style={{
          width: "100%",
          height: 180,
          objectFit: "cover",
        }}
      />

      {/* Contenido */}
      <div style={{ padding: 16, flex: 1 }}>
        <h3
          style={{
            margin: "0 0 8px",
            color: "var(--color-cyan)",
            fontSize: "1.2rem",
          }}
        >
          {offer.title}
        </h3>

        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.95rem",
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          {offer.description.length > 110
            ? offer.description.slice(0, 110) + "…"
            : offer.description}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-orange)",
            }}
          >
            {offer.price.toFixed(2)} €
          </span>

          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-muted)",
            }}
          >
            {offer.available_from} → {offer.available_to}
          </span>
        </div>

        <div
          style={{
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
          }}
        >
          Capacidad diaria: {offer.daily_capacity}
        </div>

        <a
          href={`/offers/${offer._id}`}
          style={{
            marginTop: 12,
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: 8,
            background:
              "linear-gradient(135deg, var(--color-magenta), var(--color-orange))",
            color: "#fff",
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
