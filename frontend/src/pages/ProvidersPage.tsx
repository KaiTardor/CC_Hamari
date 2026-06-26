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
    api.get("/providers/")
      .then((r) => { setProviders(r.data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.error || "Error al cargar proveedores"); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ width: 280, height: 200, borderRadius: "var(--radius-lg)" }} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
      <p style={{ color: "var(--color-magenta)" }}>{error}</p>
    </div>
  );

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1 className="grad-text anim-fade-in-up" style={{
        marginBottom: 8,
        fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
        fontFamily: "var(--font-display)",
      }}>
        Nuestros Proveedores
      </h1>
      <p className="anim-fade-in-up delay-1" style={{ color: "var(--color-text-dim)", marginBottom: 32, fontSize: "0.95rem" }}>
        Aliados que hacen posible experiencias únicas
      </p>

      {providers.length === 0 ? (
        <p style={{ color: "var(--color-text-dim)", textAlign: "center", marginTop: 60, fontSize: "1.05rem" }}>
          No hay proveedores registrados en este momento.
        </p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}>
          {providers.map((p, i) => (
            <div
              key={p.dni}
              className="card anim-fade-in-up"
              style={{
                padding: 24,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <h3 style={{
                color: "var(--color-text-light)",
                fontSize: "1.2rem",
                marginBottom: 14,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
              }}>
                {p.company_name}
              </h3>

              {(p.contact_name || p.contact_surname) && (
                <p style={{ color: "var(--color-text-muted)", margin: "8px 0", fontSize: "0.9rem", display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--color-orange)", fontWeight: 600, minWidth: 72 }}>Contacto:</span>
                  <span>{p.contact_name} {p.contact_surname}</span>
                </p>
              )}

              {p.email && (
                <p style={{ color: "var(--color-text-muted)", margin: "8px 0", fontSize: "0.9rem", display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--color-orange)", fontWeight: 600, minWidth: 72 }}>Email:</span>
                  <a href={`mailto:${p.email}`} style={{ color: "var(--color-cyan)", textDecoration: "none" }}>
                    {p.email}
                  </a>
                </p>
              )}

              {p.phone && (
                <p style={{ color: "var(--color-text-muted)", margin: "8px 0", fontSize: "0.9rem", display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--color-orange)", fontWeight: 600, minWidth: 72 }}>Teléfono:</span>
                  <span>{p.phone}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
