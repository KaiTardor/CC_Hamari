import { useState } from "react";
import { api, type Booking } from "../api";

export default function BookingsLookupPage() {
  const [offerId, setOfferId] = useState("");
  const [clientDni, setClientDni] = useState("");
  const [result, setResult] = useState<Booking[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function search() {
    setMsg(null); 
    setBusy(true); 
    setResult(null);
    
    try {
      const params: Record<string, string> = {};
      if (offerId) params.offer_id = offerId;
      if (clientDni) params.client_dni = clientDni;
      
      if (!params.offer_id && !params.client_dni) {
        setMsg("Introduce ID de oferta o DNI de cliente");
        setBusy(false);
        return;
      }
      
      const { data } = await api.get("/bookings/lookup", { params });
      setResult(data);
      
      if (data.length === 0) {
        setMsg("No se encontraron reservas con esos criterios");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setMsg(e.response?.data?.error ?? e.message ?? "Error en la consulta");
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  async function cancelBooking(id: string) {
    if (!confirm("¿Estás seguro de que quieres cancelar esta reserva?")) return;
    
    try {
      await api.patch(`/bookings/${id}/status`, { status: "CANCELLED" });
      setMsg("✅ Reserva cancelada correctamente");
      // Recargar resultados
      await search();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setMsg(e.response?.data?.error ?? e.message ?? "No se pudo cancelar la reserva");
    }
  }

  return (
    <div className="container" style={{ padding: "32px 0" }}>
      <h1 style={{
        background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: 8,
      }}>
        Consultar Reservas
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
        Busca reservas por ID de oferta o DNI de cliente
      </p>

      <div style={{ 
        display: "grid",
        gridTemplateColumns: "1fr 1fr auto",
        gap: 12, 
        marginBottom: 24,
        maxWidth: 900,
        alignItems: "flex-end",
      }}>
        <div>
          <label style={{ 
            display: "block", 
            marginBottom: 6, 
            color: "var(--color-text-light)", 
            fontSize: "0.9rem" 
          }}>
            ID de Oferta:
          </label>
          <input 
            value={offerId} 
            onChange={e => setOfferId(e.target.value)}
            placeholder="ID de la oferta"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255, 45, 117, 0.3)",
              background: "var(--color-bg-card)",
              color: "var(--color-text-light)",
              fontSize: "1rem",
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: "block", 
            marginBottom: 6, 
            color: "var(--color-text-light)", 
            fontSize: "0.9rem" 
          }}>
            DNI del Cliente:
          </label>
          <input 
            value={clientDni} 
            onChange={e => setClientDni(e.target.value)}
            placeholder="12345678A"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255, 45, 117, 0.3)",
              background: "var(--color-bg-card)",
              color: "var(--color-text-light)",
              fontSize: "1rem",
            }}
          />
        </div>

        <button onClick={search} disabled={busy} style={{ opacity: busy ? 0.6 : 1 }}>
          {busy ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {msg && (
        <div style={{
          background: msg.includes("✅") ? "rgba(0, 212, 255, 0.1)" : "rgba(255, 45, 117, 0.1)",
          border: `1px solid ${msg.includes("✅") ? "var(--color-cyan)" : "var(--color-magenta)"}`,
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          color: msg.includes("✅") ? "var(--color-cyan)" : "var(--color-magenta)",
        }}>
          {msg}
        </div>
      )}

      {result && result.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
        }}>
          {result.map(b => (
            <div
              key={b._id}
              style={{
                background: "var(--color-bg-card)",
                borderRadius: 12,
                padding: 20,
                border: `2px solid ${b.status === "CANCELLED" ? "rgba(128, 128, 128, 0.3)" : "rgba(0, 212, 255, 0.3)"}`,
                transition: "all 0.3s",
                display: "flex",
                flexDirection: "column",
                opacity: b.status === "CANCELLED" ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (b.status !== "CANCELLED") {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 212, 255, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 10, 
                marginBottom: 16 
              }}>
                <span style={{ fontSize: "1.5rem" }}>📅</span>
                <div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>Fecha</div>
                  <div style={{ 
                    color: "var(--color-cyan)", 
                    fontSize: "1.2rem", 
                    fontWeight: 700 
                  }}>
                    {b.date}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Cliente: </span>
                <span style={{ 
                  color: "var(--color-text-light)", 
                  fontWeight: 600,
                }}>
                  {b.client_dni}
                </span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Estado: </span>
                <span style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  background: b.status === "CANCELLED" 
                    ? "rgba(128, 128, 128, 0.2)" 
                    : "rgba(0, 212, 255, 0.2)",
                  color: b.status === "CANCELLED" 
                    ? "var(--color-text-muted)" 
                    : "var(--color-cyan)",
                }}>
                  {b.status === "CANCELLED" ? "CANCELADA" : b.status}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>ID Oferta: </span>
                <span style={{ 
                  color: "var(--color-text-light)", 
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                }}>
                  {b.offer_id}
                </span>
              </div>

              {b.status !== "CANCELLED" && (
                <button 
                  onClick={() => cancelBooking(b._id)}
                  style={{
                    marginTop: "auto",
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 45, 117, 0.4)",
                    background: "rgba(255, 45, 117, 0.1)",
                    color: "var(--color-magenta)",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 45, 117, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 45, 117, 0.1)";
                  }}
                >
                  Cancelar Reserva
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
