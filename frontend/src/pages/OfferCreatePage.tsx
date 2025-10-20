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
    <div className="container">
      <h1>Nueva oferta</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
        <input className="input" placeholder="Provider DNI" value={form.provider_dni} onChange={e=>set("provider_dni", e.target.value)} />
        <input className="input" placeholder="Título" value={form.title} onChange={e=>set("title", e.target.value)} />
        <textarea className="input" placeholder="Descripción" value={form.description} onChange={e=>set("description", e.target.value)} />
        <input className="input" type="number" step="0.01" placeholder="Precio" value={form.price} onChange={e=>set("price", e.target.value)} />
        <input className="input" type="number" placeholder="People included" value={form.people_included} onChange={e=>set("people_included", e.target.value)} />
        <label>Desde: <input className="input" type="date" value={form.fromISO} onChange={e=>set("fromISO", e.target.value)} /></label>
        <label>Hasta: <input className="input" type="date" value={form.toISO} onChange={e=>set("toISO", e.target.value)} /></label>
        <input className="input" type="number" placeholder="Capacidad diaria" value={form.daily_capacity} onChange={e=>set("daily_capacity", e.target.value)} />
        <button className="btn" type="submit">Crear</button>
      </form>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
