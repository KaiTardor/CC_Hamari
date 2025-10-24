import { useState } from "react";
import { createOffer } from "../api";

function toDDMMYYYY(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d.padStart(2,"0")}/${m.padStart(2,"0")}/${y}`;
}

export default function OfferCreatePage() {
  const [form, setForm] = useState({
    provider_dni: "",
    title: "",
    description: "",
    price: "0",
    people_included: "1",
    fromISO: "",
    toISO: "",
    daily_capacity: "5",
  });
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm(s => ({ ...s, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await createOffer({
        provider_dni: form.provider_dni,
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        people_included: parseInt(form.people_included || "1"),
        available_from: toDDMMYYYY(form.fromISO),
        available_to: toDDMMYYYY(form.toISO),
        daily_capacity: parseInt(form.daily_capacity || "5"),
        is_active: true,
      });
      setMsg("✅ Oferta creada");
    } catch (e: any) {
      setMsg(e?.response?.data?.error ?? "Error al crear la oferta");
    }
  }

  return (
    <div className="container" style={{ padding: "32px 0", maxWidth: 700 }}>
      <h1 style={{
        background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: 8,
        textAlign: "center",
      }}>
        Crear Nueva Oferta
      </h1>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: 24 }}>
        Completa los datos para publicar tu oferta
      </p>

      {msg && (
        <div style={{
          background: msg.includes("✅") ? "rgba(0, 212, 255, 0.1)" : "rgba(255, 45, 117, 0.1)",
          border: `1px solid ${msg.includes("✅") ? "var(--color-cyan)" : "var(--color-magenta)"}`,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          color: msg.includes("✅") ? "var(--color-cyan)" : "var(--color-magenta)",
        }}>
          {msg}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
            DNI del Proveedor *
          </label>
          <input
            placeholder="12345678A"
            value={form.provider_dni}
            onChange={e=>set("provider_dni", e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
            Título de la Oferta *
          </label>
          <input
            placeholder="Ejemplo: Tour por la ciudad"
            value={form.title}
            onChange={e=>set("title", e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
            Descripción *
          </label>
          <textarea
            placeholder="Describe tu oferta en detalle..."
            value={form.description}
            onChange={e=>set("description", e.target.value)}
            required
            rows={4}
            style={{...inputStyle, resize: "vertical"}}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
              Precio (€) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.price}
              onChange={e=>set("price", e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
              Personas Incluidas *
            </label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={form.people_included}
              onChange={e=>set("people_included", e.target.value)}
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
              Disponible Desde *
            </label>
            <input
              type="date"
              value={form.fromISO}
              onChange={e=>set("fromISO", e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
              Disponible Hasta *
            </label>
            <input
              type="date"
              value={form.toISO}
              onChange={e=>set("toISO", e.target.value)}
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
            Capacidad Diaria *
          </label>
          <input
            type="number"
            min="1"
            placeholder="5"
            value={form.daily_capacity}
            onChange={e=>set("daily_capacity", e.target.value)}
            required
            style={inputStyle}
          />
          <small style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            Número máximo de reservas por día
          </small>
        </div>

        <button
          type="submit"
          style={{
            marginTop: 16,
            padding: "12px 24px",
            fontSize: "1.1rem",
          }}
        >
          Crear Oferta
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255, 45, 117, 0.3)",
  background: "var(--color-bg-card)",
  color: "var(--color-text-light)",
  fontSize: "1rem",
};
