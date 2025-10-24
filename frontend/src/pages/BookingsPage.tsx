import { useState, useEffect, useCallback } from "react";
import { fetchBookings, cancelBooking, type Booking } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function BookingsPage() {
  const { user } = useAuth();
  const [dni, setDni] = useState("");
  const [items, setItems] = useState<Booking[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si el usuario es cliente, usar su DNI automáticamente
  const isClient = user?.role === "client";

  const loadBookings = useCallback(async (dniToUse?: string) => {
    const searchDni = dniToUse ?? dni;
    if (!searchDni) {
      setMsg("Por favor, ingresa un DNI");
      return;
    }

    setLoading(true);
    setMsg(null);
    try {
      const bookings = await fetchBookings(searchDni);
      setItems(bookings);
      if (bookings.length === 0) {
        setMsg("No se encontraron reservas para este DNI");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setMsg(e.response?.data?.error ?? e.message ?? "Error consultando reservas");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [dni]);

  useEffect(() => {
    if (isClient && user?.ref_dni) {
      setDni(user.ref_dni);
      void loadBookings(user.ref_dni);
    }
  }, [isClient, user?.ref_dni, loadBookings]);

  async function cancel(id: string) {
    if (!confirm("¿Estás seguro de que quieres cancelar esta reserva?")) return;
    
    try {
      await cancelBooking(id);
      await loadBookings();
      setMsg("✅ Reserva cancelada correctamente");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setMsg(e.response?.data?.error ?? e.message ?? "No se pudo cancelar");
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
        Mis Reservas
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
        {isClient ? "Aquí puedes ver y gestionar todas tus reservas" : "Consulta las reservas por DNI"}
      </p>

      {/* Solo mostrar búsqueda si no es cliente */}
      {!isClient && (
        <div style={{ 
          display: "flex", 
          gap: 12, 
          marginBottom: 24, 
          maxWidth: 600,
          alignItems: "flex-end",
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: "block", 
              marginBottom: 6, 
              color: "var(--color-text-light)", 
              fontSize: "0.9rem" 
            }}>
              DNI:
            </label>
            <input 
              value={dni} 
              onChange={e=>setDni(e.target.value)}
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
          <button onClick={() => loadBookings()} disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      )}

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

      {loading && (
        <div style={{ textAlign: "center", color: "var(--color-text-muted)", marginTop: 40 }}>
          Cargando reservas...
        </div>
      )}

      {!loading && items.length === 0 && !msg && (
        <div style={{ textAlign: "center", color: "var(--color-text-muted)", marginTop: 40 }}>
          {isClient ? "Aún no tienes reservas" : "Realiza una búsqueda para ver las reservas"}
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 20,
      }}>
        {items.map(b => (
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
                onClick={() => cancel(b._id)}
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
    </div>
  );
}
