import { useState } from "react";
import { api, type Offer } from "../api";
import { Link } from "react-router-dom";

export default function StaffLookupPage() {
  const [offerId, setOfferId] = useState("");
  const [providerDni, setProviderDni] = useState("");
  const [result, setResult] = useState<Offer[] | Offer | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function search() {
    setMsg(null); setBusy(true); setResult(null);
    try {
      const params: Record<string, string> = {};
      if (offerId) params.offer_id = offerId;
      if (providerDni) params.provider_dni = providerDni;
      if (!params.offer_id && !params.provider_dni) { setMsg("Introduce offer_id o provider_dni"); setBusy(false); return; }
      const { data } = await api.get("/offers/lookup", { params });
      setResult(data);
      if (Array.isArray(data) && data.length === 0) setMsg("No se encontraron resultados");
    } catch (err: unknown) {
      type AxiosErrorLike = { response?: { data?: { error?: string } }; message?: string };
      let message = "Error en la consulta";
      if (err && typeof err === "object") {
        const ae = err as AxiosErrorLike;
        message = ae.response?.data?.error ?? ae.message ?? message;
      } else if (err instanceof Error) { message = err.message; }
      setMsg(message);
    } finally { setBusy(false); }
  }

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: 8, color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 500,
  };

  function renderResult() {
    if (!result) return null;
    const offers = Array.isArray(result) ? result : [result];
    if (offers.length === 0) return <p style={{ color: "var(--color-text-dim)", textAlign: "center", marginTop: 32 }}>No hay resultados.</p>;

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {offers.map((o, i) => (
          <div key={o._id} className="card anim-fade-in-up" style={{ padding: 24, animationDelay: `${i * 0.05}s` }}>
            <h3 style={{ margin: "0 0 10px", color: "var(--color-text-light)", fontFamily: "var(--font-display)", fontWeight: 700 }}>
              {o.title}
            </h3>
            <p style={{ color: "var(--color-text-dim)", fontSize: "0.88rem", margin: "0 0 4px" }}>Proveedor: {o.provider_dni}</p>
            <p style={{ color: "var(--color-text-dim)", fontSize: "0.88rem", margin: "0 0 16px" }}>
              Ventana: {o.available_from} → {o.available_to}
            </p>
            <Link to={`/offers/${o._id}`} className="btn-primary" style={{
              display: "block", textAlign: "center", padding: "10px 16px", textDecoration: "none", fontSize: "0.88rem",
            }}>
              Ver detalle
            </Link>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1 className="grad-text anim-fade-in-up" style={{
        marginBottom: 8, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontFamily: "var(--font-display)",
      }}>
        Consulta de Ofertas (Staff)
      </h1>
      <p className="anim-fade-in-up delay-1" style={{ color: "var(--color-text-dim)", marginBottom: 32, fontSize: "0.95rem" }}>
        Busca ofertas por ID o por DNI de proveedor
      </p>

      <div className="card anim-fade-in-up delay-2" style={{
        display: "flex", gap: 14, marginBottom: 28, alignItems: "end", flexWrap: "wrap", padding: 20,
      }}>
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <label style={labelStyle}>offer_id</label>
          <input value={offerId} onChange={(e) => setOfferId(e.target.value)} placeholder="ID de la oferta" />
        </div>
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <label style={labelStyle}>provider_dni</label>
          <input value={providerDni} onChange={(e) => setProviderDni(e.target.value)} placeholder="12345678A" />
        </div>
        <button className="btn-primary" onClick={search} disabled={busy} style={{ height: 44, padding: "0 24px", whiteSpace: "nowrap" }}>
          {busy ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {msg && (
        <div style={{
          background: "rgba(255, 45, 117, 0.06)", border: "1px solid rgba(255,45,117,0.2)",
          borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 20,
          color: "var(--color-magenta)", fontSize: "0.9rem",
        }}>{msg}</div>
      )}

      {renderResult()}
    </div>
  );
}
