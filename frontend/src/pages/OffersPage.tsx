import { useEffect, useState, useCallback } from "react";
import { fetchOffers, type Offer } from "../api";
import { Link } from "react-router-dom";

function toDDMMYYYY(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [q, setQ] = useState("");
  const [dateISO, setDateISO] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const params: Record<string, string> = {};
      if (q) params.q = q;
      if (dateISO) params.date = toDDMMYYYY(dateISO);
      setOffers(await fetchOffers(params));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErr(e.message ?? "Error cargando ofertas");
    } finally {
      setLoading(false);
    }
  }, [q, dateISO]);

  useEffect(() => { load(); /* on mount and when load changes */ }, [load]);

  return (
    <div className="container" style={{ padding: "32px 0" }}>
      <h1 style={{
        background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: 24,
      }}>
        Ofertas Disponibles
      </h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
            Buscar:
          </label>
          <input 
            value={q} 
            onChange={e=>setQ(e.target.value)}
            placeholder="Buscar ofertas..."
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255, 45, 117, 0.3)",
              background: "var(--color-bg-card)",
              color: "var(--color-text-light)",
              fontSize: "1rem",
            }}
          />
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
            Fecha:
          </label>
          <input 
            type="date" 
            value={dateISO} 
            onChange={e=>setDateISO(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255, 45, 117, 0.3)",
              background: "var(--color-bg-card)",
              color: "var(--color-text-light)",
              fontSize: "1rem",
            }}
          />
        </div>
        <button onClick={load} disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? "Filtrando..." : "Filtrar"}
        </button>
      </div>

      {loading && <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Cargando…</div>}
      {err && <div style={{ color: "var(--color-magenta)", textAlign: "center" }}>{err}</div>}
      {!loading && offers.length === 0 && !err && (
        <div style={{ textAlign: "center", color: "var(--color-text-muted)", marginTop: 40 }}>
          No hay ofertas disponibles.
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 20,
      }}>
        {offers.map(o => (
          <div
            key={o._id}
            style={{
              background: "var(--color-bg-card)",
              borderRadius: 12,
              padding: 20,
              border: "2px solid rgba(255, 45, 117, 0.3)",
              transition: "all 0.3s",
              display: "flex",
              flexDirection: "column",
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
            <h3 style={{
              color: "var(--color-cyan)",
              fontSize: "1.3rem",
              marginBottom: 12,
              fontWeight: 700,
              margin: "0 0 12px 0",
            }}>
              {o.title}
            </h3>
            <p style={{ color: "var(--color-text-muted)", margin: "0 0 16px 0", lineHeight: 1.5, flex: 1 }}>
              {o.description}
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
                <strong style={{ color: "var(--color-orange)" }}>Precio:</strong> {o.price.toFixed(2)} €
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                <strong style={{ color: "var(--color-orange)" }}>Disponible:</strong> {o.available_from} → {o.available_to}
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                <strong style={{ color: "var(--color-orange)" }}>Capacidad/día:</strong> {o.daily_capacity}
              </div>
            </div>

            <Link 
              to={`/offers/${o._id}`}
              style={{
                display: "inline-block",
                textAlign: "center",
                padding: "10px 20px",
                borderRadius: 8,
                background: "linear-gradient(135deg, var(--color-cyan), var(--color-magenta))",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Ver Detalles →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
