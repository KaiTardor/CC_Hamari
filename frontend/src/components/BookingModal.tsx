import { useState } from "react";
import { fetchAvailability, createBooking } from "../api";

function toDDMMYYYY(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d.padStart(2,"0")}/${m.padStart(2,"0")}/${y}`;
}

export default function BookingModal({
  offerId, onClose, clientDniDefault,
}: { offerId: string; onClose: (ok?: boolean) => void; clientDniDefault?: string; }) {
  const [dateISO, setDateISO] = useState("");
  const [dni, setDni] = useState(clientDniDefault ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true); setMsg(null);
    if (!dateISO || !dni) { setMsg("Rellena fecha y DNI."); setBusy(false); return; }
    const date = toDDMMYYYY(dateISO);

    try { await fetchAvailability(offerId, date); }
    catch (e: any) { setMsg(e?.response?.data?.error ?? "Sin disponibilidad."); setBusy(false); return; }

    try {
      await createBooking({ offer_id: offerId, client_dni: dni, date });
      setMsg("✅ Reserva creada");
      setTimeout(() => onClose(true), 800);
    } catch (e: any) {
      setMsg(e?.response?.data?.error ?? "Error al reservar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{ background: "white", borderRadius: 12, padding: 16, width: "100%", maxWidth: 420 }}>
        <h3>Reservar</h3>

        <label style={{ display: "block", marginTop: 8 }}>
          Fecha:
          <input type="date" value={dateISO} onChange={e=>setDateISO(e.target.value)} className="input" style={{ width: "100%", marginTop: 4 }} />
        </label>

        <label style={{ display: "block", marginTop: 8 }}>
          DNI cliente:
          <input value={dni} onChange={e=>setDni(e.target.value)} placeholder="12345678A" className="input" style={{ width: "100%", marginTop: 4 }} />
        </label>

        {msg && <div style={{ marginTop: 8 }}>{msg}</div>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={()=>onClose()} className="btn" style={{ background: "#eee", color: "#222" }}>Cancelar</button>
          <button onClick={confirm} className="btn" disabled={busy}>Reservar</button>
        </div>
      </div>
    </div>
  );
}
