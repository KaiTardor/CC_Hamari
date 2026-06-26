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
    setLoading(true);
    setErr(null);
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

  useEffect(() => { load(); }, [load]);

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1 className="grad-text anim-fade-in-up" style={{
        marginBottom: 8,
        fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
        fontFamily: "var(--font-display)",
      }}>
        Ofertas Disponibles
      </h1>
      <p className="anim-fade-in-up delay-1" style={{ color: "var(--color-text-dim)", marginBottom: 32, fontSize: "0.95rem" }}>
        Encuentra la experiencia perfecta para ti
      </p>

      {/* Filters */}
      <div className="card anim-fade-in-up delay-2" style={{
        display: "flex",
        gap: 14,
        marginBottom: 32,
        alignItems: "end",
        flexWrap: "wrap",
        padding: 20,
      }}>
        <div style={{ flex: "1 1 360px", minWidth: 0 }}>
          <label style={{
            display: "block", marginBottom: 8,
            color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 500,
          }}>
            Buscar
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar ofertas..."
          />
        </div>
        <div style={{ flex: "0 1 240px", minWidth: 200 }}>
          <label style={{
            display: "block", marginBottom: 8,
            color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 500,
          }}>
            Fecha
          </label>
          <input
            type="date"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
            style={{ colorScheme: "dark" }}
          />
        </div>
        <button
          className="btn-primary"
          onClick={load}
          disabled={loading}
          style={{ height: 44, whiteSpace: "nowrap", flex: "0 0 auto", padding: "0 24px" }}
        >
          {loading ? "Filtrando..." : "Filtrar"}
        </button>
      </div>

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 320, borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>
      )}

      {err && (
        <div style={{
          color: "var(--color-magenta)", textAlign: "center", padding: 24,
          background: "rgba(255,45,117,0.05)", borderRadius: "var(--radius-sm)",
        }}>
          {err}
        </div>
      )}

      {!loading && offers.length === 0 && !err && (
        <div style={{ textAlign: "center", color: "var(--color-text-dim)", marginTop: 60, fontSize: "1.05rem" }}>
          No hay ofertas disponibles.
        </div>
      )}

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 20,
      }}>
        {offers.map((o, i) => (
          <div
            key={o._id}
            className="card anim-fade-in-up"
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              animationDelay: `${Math.min(i * 0.05, 0.3)}s`,
            }}
          >
            <h3 style={{
              color: "var(--color-text-light)",
              fontSize: "1.2rem",
              margin: "0 0 12px",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
            }}>
              {o.title}
            </h3>

            <p style={{
              color: "var(--color-text-muted)",
              margin: "0 0 18px",
              lineHeight: 1.6,
              flex: 1,
              fontSize: "0.9rem",
            }}>
              {o.description}
            </p>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 18,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--color-text-dim)", fontSize: "0.85rem" }}>Precio</span>
                <span style={{ color: "var(--color-orange)", fontWeight: 700, fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>
                  {o.price.toFixed(2)} €
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--color-text-dim)", fontSize: "0.85rem" }}>Disponible</span>
                <span className="badge badge-cyan" style={{ fontSize: "0.78rem" }}>
                  {o.available_from} → {o.available_to}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--color-text-dim)", fontSize: "0.85rem" }}>Capacidad/día</span>
                <span style={{ color: "var(--color-text-light)", fontWeight: 600, fontSize: "0.9rem" }}>
                  {o.daily_capacity}
                </span>
              </div>
            </div>

            <Link
              to={`/offers/${o._id}`}
              className="btn-primary"
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px 18px",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 600,
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
