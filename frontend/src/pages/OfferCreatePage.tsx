import { useState } from "react";
import { createOffer } from "../api";

function toDDMMYYYY(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

export default function OfferCreatePage() {
  const [form, setForm] = useState({
    provider_dni: "", title: "", description: "", price: "0",
    people_included: "1", fromISO: "", toISO: "", daily_capacity: "5",
  });
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    try {
      await createOffer({
        provider_dni: form.provider_dni, title: form.title, description: form.description,
        price: parseFloat(form.price), people_included: parseInt(form.people_included || "1"),
        available_from: toDDMMYYYY(form.fromISO), available_to: toDDMMYYYY(form.toISO),
        daily_capacity: parseInt(form.daily_capacity || "5"), is_active: true,
      });
      setMsg("✅ Oferta creada");
    } catch (err: unknown) {
      type AxiosLike = { response?: { data?: { error?: string } }; message?: string };
      let message = "Error al crear la oferta";
      if (err && typeof err === "object") {
        const ae = err as AxiosLike;
        message = ae.response?.data?.error ?? ae.message ?? message;
      } else if (err instanceof Error) { message = err.message; }
      setMsg(message);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: 8, color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 500,
  };
  const grid2: React.CSSProperties = {
    display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16,
  };

  return (
    <div className="container" style={{ padding: "40px 0", maxWidth: 680 }}>
      <div className="card anim-fade-in-up" style={{ padding: "40px 36px" }}>
        <h1 className="grad-text" style={{
          marginBottom: 8, textAlign: "center", fontSize: "1.8rem", fontFamily: "var(--font-display)",
        }}>
          Crear Nueva Oferta
        </h1>
        <p style={{ textAlign: "center", color: "var(--color-text-dim)", marginBottom: 32, fontSize: "0.95rem" }}>
          Completa los datos para publicar tu oferta
        </p>

        {msg && (
          <div style={{
            background: msg.includes("✅") ? "rgba(0, 230, 138, 0.06)" : "rgba(255, 45, 117, 0.06)",
            border: `1px solid ${msg.includes("✅") ? "rgba(0,230,138,0.2)" : "rgba(255,45,117,0.2)"}`,
            borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 20,
            color: msg.includes("✅") ? "var(--color-emerald)" : "var(--color-magenta)",
            fontSize: "0.9rem", overflowWrap: "anywhere",
          }}>{msg}</div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>DNI del Proveedor *</label>
            <input placeholder="12345678A" value={form.provider_dni} onChange={(e) => set("provider_dni", e.target.value)} required />
          </div>

          <div>
            <label style={labelStyle}>Título de la Oferta *</label>
            <input placeholder="Ejemplo: Tour por la ciudad" value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>

          <div>
            <label style={labelStyle}>Descripción *</label>
            <textarea
              placeholder="Describe tu oferta en detalle..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
              rows={4}
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={grid2}>
            <div>
              <label style={labelStyle}>Precio (€) *</label>
              <input type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={(e) => set("price", e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Personas Incluidas *</label>
              <input type="number" min="1" placeholder="1" value={form.people_included} onChange={(e) => set("people_included", e.target.value)} required />
            </div>
          </div>

          <div style={grid2}>
            <div>
              <label style={labelStyle}>Disponible Desde *</label>
              <input type="date" value={form.fromISO} onChange={(e) => set("fromISO", e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Disponible Hasta *</label>
              <input type="date" value={form.toISO} onChange={(e) => set("toISO", e.target.value)} required />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Capacidad Diaria *</label>
            <input type="number" min="1" placeholder="5" value={form.daily_capacity} onChange={(e) => set("daily_capacity", e.target.value)} required />
            <small style={{ color: "var(--color-text-dim)", fontSize: "0.82rem" }}>Número máximo de reservas por día</small>
          </div>

          <button type="submit" className="btn-primary" style={{
            marginTop: 8, padding: "14px 24px", fontSize: "1.05rem", width: "100%",
          }}>
            Crear Oferta
          </button>
        </form>
      </div>
    </div>
  );
}
