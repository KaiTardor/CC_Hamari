import { useState } from "react";
import { api, type Booking } from "../api";
import { useConfirm } from "../components/useConfirm";

export default function BookingsLookupPage() {
  const { confirm } = useConfirm();
  const [offerId, setOfferId] = useState("");
  const [clientDni, setClientDni] = useState("");
  const [result, setResult] = useState<Booking[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function search() {
    setMsg(null); setBusy(true); setResult(null);
    try {
      const params: Record<string, string> = {};
      if (offerId) params.offer_id = offerId;
      if (clientDni) params.client_dni = clientDni;
      if (!params.offer_id && !params.client_dni) { setMsg("Introduce ID de oferta o DNI de cliente"); setBusy(false); return; }
      const { data } = await api.get("/bookings/lookup", { params });
      setResult(data);
      if (data.length === 0) setMsg("No se encontraron reservas con esos criterios");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setMsg(e.response?.data?.error ?? e.message ?? "Error en la consulta");
      setResult(null);
    } finally { setBusy(false); }
  }

  async function cancelBooking(id: string) {
    const confirmed = await confirm({
      title: "Cancelar reserva",
      message: "¿Estás seguro de que quieres cancelar esta reserva? La operación actualizará el estado inmediatamente.",
      confirmLabel: "Cancelar reserva",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await api.patch(`/bookings/${id}/status`, { status: "CANCELLED" });
      setMsg("✅ Reserva cancelada correctamente");
      await search();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setMsg(e.response?.data?.error ?? e.message ?? "No se pudo cancelar la reserva");
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: 8, color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 500,
  };

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1 className="grad-text anim-fade-in-up" style={{
        marginBottom: 8, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontFamily: "var(--font-display)",
      }}>
        Consultar Reservas
      </h1>
      <p className="anim-fade-in-up delay-1" style={{ color: "var(--color-text-dim)", marginBottom: 32, fontSize: "0.95rem" }}>
        Busca reservas por ID de oferta o DNI de cliente
      </p>

      <div className="card anim-fade-in-up delay-2" style={{
        display: "flex", gap: 14, marginBottom: 28, alignItems: "end", flexWrap: "wrap", padding: 20,
      }}>
        <div style={{ flex: "1 1 300px", minWidth: 0 }}>
          <label style={labelStyle}>ID de Oferta</label>
          <input value={offerId} onChange={(e) => setOfferId(e.target.value)} placeholder="ID de la oferta" />
        </div>
        <div style={{ flex: "1 1 300px", minWidth: 0 }}>
          <label style={labelStyle}>DNI del Cliente</label>
          <input value={clientDni} onChange={(e) => setClientDni(e.target.value)} placeholder="12345678A" />
        </div>
        <button className="btn-primary" onClick={search} disabled={busy} style={{ height: 44, padding: "0 24px", whiteSpace: "nowrap" }}>
          {busy ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {msg && (
        <div style={{
          background: msg.includes("✅") ? "rgba(0, 230, 138, 0.06)" : "rgba(255, 45, 117, 0.06)",
          border: `1px solid ${msg.includes("✅") ? "rgba(0,230,138,0.2)" : "rgba(255,45,117,0.2)"}`,
          borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 20,
          color: msg.includes("✅") ? "var(--color-emerald)" : "var(--color-magenta)", fontSize: "0.9rem",
        }}>{msg}</div>
      )}

      {result && result.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {result.map((b, i) => {
            const isCancelled = b.status === "CANCELLED";
            return (
              <div key={b._id} className="card anim-fade-in-up" style={{
                padding: 22, display: "flex", flexDirection: "column",
                opacity: isCancelled ? 0.55 : 1,
                borderColor: isCancelled ? "rgba(157,150,173,0.15)" : "rgba(0,212,255,0.15)",
                animationDelay: `${i * 0.05}s`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
                  <div>
                    <div style={{ color: "var(--color-text-dim)", fontSize: "0.78rem", marginBottom: 2 }}>Fecha</div>
                    <div style={{ color: "var(--color-cyan)", fontSize: "1.15rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>{b.date}</div>
                  </div>
                  <span className={`badge ${isCancelled ? "badge-muted" : "badge-emerald"}`}>
                    {isCancelled ? "CANCELADA" : b.status}
                  </span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: "var(--color-text-dim)", fontSize: "0.82rem" }}>Cliente: </span>
                  <span style={{ color: "var(--color-text-light)", fontWeight: 600, fontSize: "0.9rem" }}>{b.client_dni}</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ color: "var(--color-text-dim)", fontSize: "0.82rem" }}>ID Oferta: </span>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{b.offer_id}</span>
                </div>
                {!isCancelled && (
                  <button className="btn-danger" onClick={() => cancelBooking(b._id)} style={{ marginTop: "auto", padding: "10px 16px", fontSize: "0.88rem" }}>
                    Cancelar Reserva
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
