import { useEffect, useState } from "react";
import { api } from "../api";

type Provider = {
  dni: string;
  company_name: string;
  contact_name?: string;
  contact_surname?: string;
  email?: string;
  phone?: string;
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/providers/")
      .then((r) => {
        setProviders(r.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Error al cargar proveedores");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: "32px 0", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Cargando proveedores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "32px 0", textAlign: "center" }}>
        <p style={{ color: "var(--color-magenta)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "32px 0" }}>
      <h1
        style={{
          background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 24,
        }}
      >
        Nuestros Proveedores
      </h1>

      {providers.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", textAlign: "center", marginTop: 40 }}>
          No hay proveedores registrados en este momento.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {providers.map((p) => (
            <div
              key={p.dni}
              style={{
                background: "var(--color-bg-card)",
                borderRadius: 12,
                padding: 20,
                border: "2px solid rgba(255, 45, 117, 0.3)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(255, 45, 117, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h3
                style={{
                  color: "var(--color-cyan)",
                  fontSize: "1.3rem",
                  marginBottom: 12,
                  fontWeight: 700,
                }}
              >
                {p.company_name}
              </h3>

              {(p.contact_name || p.contact_surname) && (
                <p style={{ color: "var(--color-text-muted)", margin: "8px 0", fontSize: "0.95rem" }}>
                  <strong style={{ color: "var(--color-orange)" }}>Contacto:</strong>{" "}
                  {p.contact_name} {p.contact_surname}
                </p>
              )}

              {p.email && (
                <p style={{ color: "var(--color-text-muted)", margin: "8px 0", fontSize: "0.95rem" }}>
                  <strong style={{ color: "var(--color-orange)" }}>Email:</strong>{" "}
                  <a
                    href={`mailto:${p.email}`}
                    style={{ color: "var(--color-cyan)", textDecoration: "none" }}
                  >
                    {p.email}
                  </a>
                </p>
              )}

              {p.phone && (
                <p style={{ color: "var(--color-text-muted)", margin: "8px 0", fontSize: "0.95rem" }}>
                  <strong style={{ color: "var(--color-orange)" }}>Teléfono:</strong> {p.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
