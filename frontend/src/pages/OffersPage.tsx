import { useEffect, useState } from "react";
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

  async function load() {
    setLoading(true); setErr(null);
    try {
      const params: any = {};
      if (q) params.q = q;
      if (dateISO) params.date = toDDMMYYYY(dateISO);
      setOffers(await fetchOffers(params));
    } catch (e: any) {
      setErr(e?.message ?? "Error cargando ofertas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* on mount */ }, []);

  return (
    <div className="container">
      <h1>Ofertas</h1>

      <div className="row" style={{ marginBottom: 12 }}>
        <label>Buscar:
          <input className="input" value={q} onChange={e=>setQ(e.target.value)} />
        </label>
        <label>Fecha:
          <input className="input" type="date" value={dateISO} onChange={e=>setDateISO(e.target.value)} />
        </label>
        <button className="btn" onClick={load} disabled={loading}>Filtrar</button>
      </div>

      {loading && <div>Cargando…</div>}
      {err && <div style={{ color: "red" }}>{err}</div>}
      {!loading && offers.length === 0 && !err && <div>No hay ofertas.</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {offers.map(o => (
          <div key={o._id} className="card">
            <h3 style={{ margin: 0 }}>{o.title}</h3>
            <p style={{ color: "#555" }}>{o.description}</p>
            <div>Precio: {o.price.toFixed(2)} €</div>
            <div>Ventana: {o.available_from} → {o.available_to}</div>
            <div>Capacidad/día: {o.daily_capacity}</div>
            <div style={{ marginTop: 8 }}>
              <Link className="link" to={`/offers/${o._id}`}>Ver detalle</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
