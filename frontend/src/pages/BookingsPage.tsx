import { useState } from "react";
import { fetchBookings, cancelBooking, type Booking } from "../api";

export default function BookingsPage() {
  const [dni, setDni] = useState("");
  const [items, setItems] = useState<Booking[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setMsg(null);
    try { setItems(await fetchBookings(dni)); }
    catch (e: any) { setMsg(e?.response?.data?.error ?? "Error consultando reservas"); }
  }

  async function cancel(id: string) {
    try { await cancelBooking(id); await load(); }
    catch (e: any) { setMsg(e?.response?.data?.error ?? "No se pudo cancelar"); }
  }

  return (
    <div className="container">
      <h1>Reservas por DNI</h1>
      <div className="row" style={{ marginBottom: 12 }}>
        <label>DNI:
          <input className="input" value={dni} onChange={e=>setDni(e.target.value)} />
        </label>
        <button className="btn" onClick={load}>Buscar</button>
      </div>

      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}

      <ul style={{ display:"grid", gap:12, paddingLeft:0 }}>
        {items.map(b => (
          <li key={b._id} className="card" style={{ listStyle:"none" }}>
            <div><b>Fecha:</b> {b.date}</div>
            <div><b>Estado:</b> {b.status}</div>
            <div><b>Oferta:</b> {b.offer_id}</div>
            {b.status !== "CANCELLED" && (
              <button className="btn" style={{ background:"#eee", color:"#222", marginTop:8 }} onClick={()=>cancel(b._id)}>
                Cancelar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
