import { useState, useEffect, useCallback } from "react";
import { api, getApiErrorMessage, type Offer } from "../api";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function OffersLookupPage() {
  const { user } = useAuth();
  const [providerDni, setProviderDni] = useState("");
  const [result, setResult] = useState<Offer[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isProvider = user?.role === "provider";

  const searchOffers = useCallback(async (searchDni: string) => {
    if (!searchDni) { setMsg("Por favor, ingresa un DNI de proveedor"); return; }
    setMsg(null); setBusy(true); setResult(null);
    try {
      const { data } = await api.get("/offers/lookup", { params: { provider_dni: searchDni } });
      setResult(data);
      if (data.length === 0) setMsg("No se encontraron ofertas para este proveedor");
    } catch (err: unknown) {
      setMsg(getApiErrorMessage(err, "Error en la consulta"));
      setResult(null);
    } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    if (isProvider && user?.ref_dni) { setProviderDni(user.ref_dni); void searchOffers(user.ref_dni); }
  }, [isProvider, user?.ref_dni, searchOffers]);

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: 8, color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 500,
  };

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1 className="grad-text anim-fade-in-up" style={{
        marginBottom: 8, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontFamily: "var(--font-display)",
      }}>
        {isProvider ? "Mis Ofertas" : "Consultar Ofertas"}
      </h1>
      <p className="anim-fade-in-up delay-1" style={{ color: "var(--color-text-dim)", marginBottom: 32, fontSize: "0.95rem" }}>
        {isProvider ? "Aquí puedes ver y gestionar todas tus ofertas publicadas" : "Busca ofertas por DNI de proveedor"}
      </p>

      {!isProvider && (
        <div className="card anim-fade-in-up delay-2" style={{
          display: "flex", gap: 12, marginBottom: 28, maxWidth: 500, alignItems: "end", padding: 20, flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>DNI del Proveedor</label>
            <input value={providerDni} onChange={(e) => setProviderDni(e.target.value)} placeholder="12345678A" />
          </div>
          <button className="btn-primary" onClick={() => searchOffers(providerDni)} disabled={busy} style={{ height: 44, padding: "0 24px" }}>
            {busy ? "Buscando..." : "Buscar"}
          </button>
        </div>
      )}

      {msg && (
        <div style={{
          background: msg.includes("✅") ? "rgba(0, 230, 138, 0.06)" : "rgba(255, 45, 117, 0.06)",
          border: `1px solid ${msg.includes("✅") ? "rgba(0,230,138,0.2)" : "rgba(255,45,117,0.2)"}`,
          borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 20,
          color: msg.includes("✅") ? "var(--color-emerald)" : "var(--color-magenta)", fontSize: "0.9rem",
        }}>{msg}</div>
      )}

      {busy && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 300, borderRadius: "var(--radius-lg)" }} />)}
        </div>
      )}

      {!busy && result && result.length === 0 && !msg && (
        <div style={{ textAlign: "center", color: "var(--color-text-dim)", marginTop: 60, fontSize: "1.05rem" }}>
          {isProvider ? "Aún no tienes ofertas publicadas" : "No se encontraron ofertas"}
        </div>
      )}

      {result && result.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {result.map((o, i) => (
            <div key={o._id} className="card anim-fade-in-up" style={{
              padding: 24, display: "flex", flexDirection: "column", animationDelay: `${i * 0.05}s`,
            }}>
              <h3 style={{
                color: "var(--color-text-light)", fontSize: "1.15rem", fontFamily: "var(--font-display)",
                fontWeight: 700, margin: "0 0 12px",
              }}>
                {o.title}
              </h3>
              <p style={{ color: "var(--color-text-muted)", margin: "0 0 16px", lineHeight: 1.6, flex: 1, fontSize: "0.9rem" }}>
                {o.description}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-dim)", fontSize: "0.85rem" }}>Precio</span>
                  <span style={{ color: "var(--color-orange)", fontWeight: 700, fontFamily: "var(--font-display)" }}>{o.price.toFixed(2)} €</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--color-text-dim)", fontSize: "0.85rem" }}>Disponible</span>
                  <span className="badge badge-cyan" style={{ fontSize: "0.78rem" }}>{o.available_from} → {o.available_to}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-dim)", fontSize: "0.85rem" }}>Capacidad/día</span>
                  <span style={{ color: "var(--color-text-light)", fontWeight: 600 }}>{o.daily_capacity}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--color-text-dim)", fontSize: "0.85rem" }}>Estado</span>
                  <span className={`badge ${o.is_active ? "badge-emerald" : "badge-muted"}`}>
                    {o.is_active ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
              <Link to={`/offers/${o._id}`} className="btn-primary" style={{
                display: "block", textAlign: "center", padding: "10px 18px", textDecoration: "none", fontSize: "0.9rem",
              }}>
                Ver Detalles →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
