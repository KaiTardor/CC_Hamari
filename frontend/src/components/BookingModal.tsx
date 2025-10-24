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

  // Si el DNI viene por defecto (cliente), lo hacemos read only
  const isDniReadonly = !!clientDniDefault;

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
      position: "fixed", 
      inset: 0, 
      background: "rgba(0,0,0,.7)",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: 16,
      zIndex: 1000,
    }}>
      <div style={{ 
        background: "var(--color-bg-card)", 
        borderRadius: 16, 
        padding: 28, 
        width: "100%", 
        maxWidth: 450,
        border: "2px solid rgba(255, 45, 117, 0.4)",
        boxShadow: "0 8px 32px rgba(255, 45, 117, 0.3)",
      }}>
        <h3 style={{
          background: "linear-gradient(135deg, #ff2d75, #ff9933)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 20,
          fontSize: "1.6rem",
          fontWeight: 700,
        }}>
          Confirmar Reserva
        </h3>

        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ 
            display: "block", 
            marginBottom: 8, 
            color: "var(--color-text-light)", 
            fontSize: "0.9rem",
            fontWeight: 600,
          }}>
            Fecha de la reserva:
          </span>
          <input 
            type="date" 
            value={dateISO} 
            onChange={e=>setDateISO(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255, 45, 117, 0.3)",
              background: "var(--color-bg-dark)",
              color: "var(--color-text-light)",
              fontSize: "1rem",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 20 }}>
          <span style={{ 
            display: "block", 
            marginBottom: 8, 
            color: "var(--color-text-light)", 
            fontSize: "0.9rem",
            fontWeight: 600,
          }}>
            DNI del cliente:
          </span>
          <input 
            value={dni} 
            onChange={e=>setDni(e.target.value)} 
            placeholder="12345678A"
            readOnly={isDniReadonly}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${isDniReadonly ? "rgba(0, 212, 255, 0.3)" : "rgba(255, 45, 117, 0.3)"}`,
              background: isDniReadonly ? "rgba(0, 212, 255, 0.05)" : "var(--color-bg-dark)",
              color: "var(--color-text-light)",
              fontSize: "1rem",
              cursor: isDniReadonly ? "not-allowed" : "text",
            }}
          />
          {isDniReadonly && (
            <small style={{ 
              display: "block", 
              marginTop: 6, 
              color: "var(--color-cyan)", 
              fontSize: "0.85rem" 
            }}>
              Tu DNI se ha completado automáticamente
            </small>
          )}
        </label>

        {msg && (
          <div style={{
            background: msg.includes("✅") ? "rgba(0, 212, 255, 0.1)" : "rgba(255, 45, 117, 0.1)",
            border: `1px solid ${msg.includes("✅") ? "var(--color-cyan)" : "var(--color-magenta)"}`,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            color: msg.includes("✅") ? "var(--color-cyan)" : "var(--color-magenta)",
            fontSize: "0.95rem",
          }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button 
            onClick={()=>onClose()}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid rgba(255, 45, 117, 0.3)",
              background: "transparent",
              color: "var(--color-text-light)",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 45, 117, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Cancelar
          </button>
          <button 
            onClick={confirm} 
            disabled={busy}
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              fontWeight: 700,
              opacity: busy ? 0.6 : 1,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Reservando..." : "Confirmar Reserva"}
          </button>
        </div>
      </div>
    </div>
  );
}
