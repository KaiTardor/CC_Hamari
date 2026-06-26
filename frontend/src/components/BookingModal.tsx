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
  const isDniReadonly = !!clientDniDefault;

  async function confirm() {
    setBusy(true); setMsg(null);
    if (!dateISO || !dni) { setMsg("Rellena fecha y DNI."); setBusy(false); return; }
    const date = toDDMMYYYY(dateISO);

    try { await fetchAvailability(offerId, date); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setMsg(e.response?.data?.error ?? e.message ?? "Sin disponibilidad.");
      setBusy(false);
      return;
    }

    try {
      await createBooking({ offer_id: offerId, client_dni: dni, date });
      setMsg("✅ Reserva creada");
      setTimeout(() => onClose(true), 800);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setMsg(e.response?.data?.error ?? e.message ?? "Error al reservar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 1000,
      animation: "fadeIn 0.2s ease",
    }}>
      <div style={{
        background: "var(--color-bg-card)",
        borderRadius: "var(--radius-lg)",
        padding: 28,
        width: "100%",
        maxWidth: 450,
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "var(--shadow-lg), 0 0 40px rgba(255,45,117,0.1)",
        animation: "scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <h3 className="grad-text" style={{
          marginBottom: 24,
          fontSize: "1.5rem",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
        }}>
          Confirmar Reserva
        </h3>

        <label style={{ display: "block", marginBottom: 18 }}>
          <span style={{
            display: "block",
            marginBottom: 8,
            color: "var(--color-text-muted)",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}>
            Fecha de la reserva
          </span>
          <input
            type="date"
            value={dateISO}
            onChange={e=>setDateISO(e.target.value)}
          />
        </label>

        <label style={{ display: "block", marginBottom: 20 }}>
          <span style={{
            display: "block",
            marginBottom: 8,
            color: "var(--color-text-muted)",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}>
            DNI del cliente
          </span>
          <input
            value={dni}
            onChange={e=>setDni(e.target.value)}
            placeholder="12345678A"
            readOnly={isDniReadonly}
            style={{
              ...(isDniReadonly ? {
                borderColor: "rgba(0, 212, 255, 0.2)",
                background: "rgba(0, 212, 255, 0.05)",
                cursor: "not-allowed",
              } : {}),
            }}
          />
          {isDniReadonly && (
            <small style={{
              display: "block",
              marginTop: 6,
              color: "var(--color-cyan)",
              fontSize: "0.82rem",
            }}>
              Tu DNI se ha completado automáticamente
            </small>
          )}
        </label>

        {msg && (
          <div style={{
            background: msg.includes("✅") ? "rgba(0, 230, 138, 0.08)" : "rgba(255, 45, 117, 0.08)",
            border: `1px solid ${msg.includes("✅") ? "rgba(0,230,138,0.2)" : "rgba(255,45,117,0.2)"}`,
            borderRadius: "var(--radius-sm)",
            padding: 12,
            marginBottom: 18,
            color: msg.includes("✅") ? "var(--color-emerald)" : "var(--color-magenta)",
            fontSize: "0.9rem",
          }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={()=>onClose()} style={{ padding: "10px 20px" }}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={confirm}
            disabled={busy}
            style={{ padding: "10px 24px", fontWeight: 700 }}
          >
            {busy ? "Reservando..." : "Confirmar Reserva"}
          </button>
        </div>
      </div>
    </div>
  );
}
