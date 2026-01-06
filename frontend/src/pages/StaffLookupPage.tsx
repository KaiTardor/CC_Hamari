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
    setMsg(null);
    setBusy(true);
    setResult(null);

    try {
      const params: Record<string, string> = {};
      if (offerId) params.offer_id = offerId;
      if (providerDni) params.provider_dni = providerDni;

      if (!params.offer_id && !params.provider_dni) {
        setMsg("Introduce offer_id o provider_dni");
        setBusy(false);
        return;
      }

      const { data } = await api.get("/offers/lookup", { params });
      setResult(data);
    } catch (err: unknown) {
      type AxiosErrorLike = { response?: { data?: { error?: string } }; message?: string };
      let message = "Error en la consulta";

      if (err && typeof err === "object") {
        const ae = err as AxiosErrorLike;
        message = ae.response?.data?.error ?? ae.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setMsg(message);
    } finally {
      setBusy(false);
    }
  }

  function renderResult() {
    if (!result) return null;

    if (Array.isArray(result)) {
      if (result.length === 0) return <div>No hay resultados.</div>;
      return (
        <div style={{ display: "grid", gap: 12 }}>
          {result.map((o) => (
            <div key={o._id} className="card">
              <h3 style={{ margin: 0 }}>{o.title}</h3>
              <div>Proveedor: {o.provider_dni}</div>
              <div>Ventana: {o.available_from} → {o.available_to}</div>
              <Link to={`/offers/${o._id}`} className="link">
                Ver detalle
              </Link>
            </div>
          ))}
        </div>
      );
    }

    const o = result as Offer;
    return (
      <div className="card">
        <h3 style={{ margin: 0 }}>{o.title}</h3>
        <div>Proveedor: {o.provider_dni}</div>
        <div>Ventana: {o.available_from} → {o.available_to}</div>
        <Link to={`/offers/${o._id}`} className="link">
          Ver detalle
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Consulta de ofertas (staff)</h1>

      {/* ACK: reemplazamos .row por GRID para evitar solapes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) auto",
          gap: 12,
          alignItems: "end",
          marginBottom: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: 6 }}>
            offer_id:
          </label>
          <input
            className="input"
            value={offerId}
            onChange={(e) => setOfferId(e.target.value)}
            style={{ width: "100%", minWidth: 0 }}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: 6 }}>
            provider_dni:
          </label>
          <input
            className="input"
            value={providerDni}
            onChange={(e) => setProviderDni(e.target.value)}
            style={{ width: "100%", minWidth: 0 }}
          />
        </div>

        <button
          className="btn"
          onClick={search}
          disabled={busy}
          style={{
            whiteSpace: "nowrap",
            height: 42,
            justifySelf: "end",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {msg && <div style={{ marginBottom: 8 }}>{msg}</div>}
      {renderResult()}
    </div>
  );
}
