import { useState, useEffect } from "react";
import { api, type Offer } from "../api";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function OffersLookupPage() {
  const { user } = useAuth();
  const [providerDni, setProviderDni] = useState("");
  const [result, setResult] = useState<Offer[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Si es provider, autocompletar con su DNI y cargar automáticamente
  const isProvider = user?.role === "provider";

  useEffect(() => {
    if (isProvider && user?.ref_dni) {
      setProviderDni(user.ref_dni);
      searchOffers(user.ref_dni);
    }
  }, [isProvider, user?.ref_dni]);

  async function searchOffers(dniToUse?: string) {
    const searchDni = dniToUse ?? providerDni;
    if (!searchDni) {
      setMsg("Por favor, ingresa un DNI de proveedor");
      return;
    }

    setMsg(null);
    setBusy(true);
    setResult(null);

    try {
      const { data } = await api.get("/offers/lookup", {
        params: { provider_dni: searchDni }
      });
      setResult(data);

      if (data.length === 0) {
        setMsg("No se encontraron ofertas para este proveedor");
      }
    } catch (e: any) {
      setMsg(e?.response?.data?.error ?? "Error en la consulta");
      setResult(null);
    } finally {
      setBusy(false);
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
        {isProvider ? "Mis Ofertas" : "Consultar Ofertas"}
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
        {isProvider 
          ? "Aquí puedes ver y gestionar todas tus ofertas publicadas" 
          : "Busca ofertas por DNI de proveedor"}
      </p>

      {/* Solo mostrar búsqueda si no es provider */}
      {!isProvider && (
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
              DNI del Proveedor:
            </label>
            <input
              value={providerDni}
              onChange={e => setProviderDni(e.target.value)}
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
          <button onClick={() => searchOffers()} disabled={busy}>
            {busy ? "Buscando..." : "Buscar"}
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

      {busy && (
        <div style={{ textAlign: "center", color: "var(--color-text-muted)", marginTop: 40 }}>
          Cargando ofertas...
        </div>
      )}

      {!busy && result && result.length === 0 && !msg && (
        <div style={{ textAlign: "center", color: "var(--color-text-muted)", marginTop: 40 }}>
          {isProvider ? "Aún no tienes ofertas publicadas" : "No se encontraron ofertas"}
        </div>
      )}

      {result && result.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
        }}>
          {result.map(o => (
            <div
              key={o._id}
              style={{
                background: "var(--color-bg-card)",
                borderRadius: 12,
                padding: 20,
                border: "2px solid rgba(255, 45, 117, 0.3)",
                transition: "all 0.3s",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(255, 45, 117, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h3 style={{
                color: "var(--color-cyan)",
                fontSize: "1.3rem",
                marginBottom: 12,
                fontWeight: 700,
                margin: "0 0 12px 0",
              }}>
                {o.title}
              </h3>
              
              <p style={{ 
                color: "var(--color-text-muted)", 
                margin: "0 0 16px 0", 
                lineHeight: 1.5, 
                flex: 1 
              }}>
                {o.description}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
                  <strong style={{ color: "var(--color-orange)" }}>Precio:</strong> {o.price.toFixed(2)} €
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                  <strong style={{ color: "var(--color-orange)" }}>Disponible:</strong> {o.available_from} → {o.available_to}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                  <strong style={{ color: "var(--color-orange)" }}>Capacidad/día:</strong> {o.daily_capacity}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                  <strong style={{ color: "var(--color-orange)" }}>Estado:</strong>{" "}
                  <span style={{ 
                    color: o.is_active ? "var(--color-cyan)" : "var(--color-text-muted)",
                    fontWeight: 600,
                  }}>
                    {o.is_active ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>

              <Link
                to={`/offers/${o._id}`}
                style={{
                  display: "inline-block",
                  textAlign: "center",
                  padding: "10px 20px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, var(--color-cyan), var(--color-magenta))",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Ver Detalles →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
