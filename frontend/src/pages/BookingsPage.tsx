import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchBookings, cancelBooking, fetchOffers, getApiErrorMessage, type Booking, type Offer } from "../api";
import { useConfirm } from "../components/useConfirm";

function parseBookingDate(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function isPastBooking(value: string) {
  const bookingDate = parseBookingDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Number.isFinite(bookingDate) && bookingDate < today.getTime();
}

export default function BookingsPage() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [dni, setDni] = useState("");
  const [items, setItems] = useState<Booking[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [offerMap, setOfferMap] = useState<Record<string, Offer>>({});
  const isClient = user?.role === "client";

  const loadBookings = useCallback(async (searchDni: string) => {
    if (!searchDni) { setMsg("Por favor, ingresa un DNI"); return; }
    setLoading(true); setMsg(null);
    try {
      const [bookings, offers] = await Promise.all([fetchBookings(searchDni), fetchOffers()]);
      setItems(bookings);
      const map: Record<string, Offer> = {};
      for (const o of offers) map[o._id] = o;
      setOfferMap(map);
      if (bookings.length === 0) setMsg("No se encontraron reservas para este DNI");
    } catch (err: unknown) {
      setMsg(getApiErrorMessage(err, "Error consultando reservas"));
      setItems([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isClient && user?.ref_dni) { setDni(user.ref_dni); void loadBookings(user.ref_dni); }
  }, [isClient, user?.ref_dni, loadBookings]);

  async function cancel(id: string) {
    const confirmed = await confirm({
      title: "Cancelar reserva",
      message: "¿Estás seguro de que quieres cancelar esta reserva? Liberaremos la plaza asociada.",
      confirmLabel: "Cancelar reserva",
      tone: "danger",
    });
    if (!confirmed) return;
    try { await cancelBooking(id); await loadBookings(dni); setMsg("✅ Reserva cancelada correctamente"); }
    catch (err: unknown) { setMsg(getApiErrorMessage(err, "No se pudo cancelar")); }
  }

  const activeBookings = items.filter((booking) => booking.status !== "CANCELLED");
  const previousBookings = items.filter((booking) => booking.status === "CANCELLED" || isPastBooking(booking.date));
  const nextBooking = activeBookings
    .filter((booking) => !isPastBooking(booking.date))
    .sort((a, b) => parseBookingDate(a.date) - parseBookingDate(b.date))[0];

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1 className="grad-text anim-fade-in-up" style={{
        marginBottom: 8, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontFamily: "var(--font-display)",
      }}>
        Mis Reservas
      </h1>
      <p className="anim-fade-in-up delay-1" style={{ color: "var(--color-text-dim)", marginBottom: 32, fontSize: "0.95rem" }}>
        {isClient ? "Aquí puedes ver y gestionar todas tus reservas" : "Consulta las reservas por DNI"}
      </p>

      {items.length > 0 && (
        <div className="booking-summary-grid anim-fade-in-up delay-2">
          <div className="booking-summary-card">
            <span>Reservas activas</span>
            <strong>{activeBookings.length}</strong>
            <p>Planes listos para disfrutar.</p>
          </div>
          <div className="booking-summary-card">
            <span>Experiencias anteriores</span>
            <strong>{previousBookings.length}</strong>
            <p>Historial de actividades realizadas o canceladas.</p>
          </div>
          <div className="booking-summary-card booking-summary-featured">
            <span>Próxima experiencia</span>
            <strong>{nextBooking ? nextBooking.date : "Sin fecha"}</strong>
            <p>{nextBooking ? offerMap[nextBooking.offer_id]?.title ?? "Oferta reservada" : "Haz una nueva reserva para llenar este espacio."}</p>
          </div>
        </div>
      )}

      {!isClient && (
        <div className="card anim-fade-in-up delay-2" style={{
          display: "flex", gap: 12, marginBottom: 28, maxWidth: 500, alignItems: "end", padding: 20, flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: "block", marginBottom: 8, color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 500 }}>DNI:</label>
            <input value={dni} onChange={(e) => setDni(e.target.value)} placeholder="12345678A" />
          </div>
          <button className="btn-primary" onClick={() => loadBookings(dni)} disabled={loading} style={{ height: 44, padding: "0 24px" }}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      )}

      {msg && (
        <div style={{
          background: msg.includes("✅") ? "rgba(0, 230, 138, 0.06)" : "rgba(255, 45, 117, 0.06)",
          border: `1px solid ${msg.includes("✅") ? "rgba(0,230,138,0.2)" : "rgba(255,45,117,0.2)"}`,
          borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 20,
          color: msg.includes("✅") ? "var(--color-emerald)" : "var(--color-magenta)", fontSize: "0.9rem",
        }}>
          {msg}
        </div>
      )}

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 240, borderRadius: "var(--radius-lg)" }} />)}
        </div>
      )}

      {!loading && items.length === 0 && !msg && (
        <div style={{ textAlign: "center", color: "var(--color-text-dim)", marginTop: 60, fontSize: "1.05rem" }}>
          {isClient ? "Aún no tienes reservas" : "Realiza una búsqueda para ver las reservas"}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {items.map((b, i) => {
          const offer = offerMap[b.offer_id];
          const isCancelled = b.status === "CANCELLED";
          return (
            <div
              key={b._id}
              className={`card anim-fade-in-up`}
              style={{
                padding: 22,
                display: "flex",
                flexDirection: "column",
                opacity: isCancelled ? 0.55 : 1,
                borderColor: isCancelled ? "rgba(157,150,173,0.15)" : "rgba(0,212,255,0.15)",
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
                <div>
                  <div style={{ color: "var(--color-text-dim)", fontSize: "0.78rem", marginBottom: 2 }}>Fecha</div>
                  <div style={{ color: "var(--color-cyan)", fontSize: "1.15rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
                    {b.date}
                  </div>
                </div>
                <span className={`badge ${isCancelled ? "badge-muted" : "badge-emerald"}`}>
                  {isCancelled ? "CANCELADA" : b.status}
                </span>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ color: "var(--color-text-dim)", fontSize: "0.78rem", marginBottom: 2 }}>Oferta</div>
                <div style={{ color: "var(--color-text-light)", fontWeight: 600, fontSize: "1rem" }}>
                  {offer?.title ?? "Oferta"}
                </div>
                {(offer?.price != null || (offer?.available_from && offer?.available_to)) && (
                  <div style={{ color: "var(--color-text-dim)", fontSize: "0.82rem", marginTop: 6 }}>
                    {offer?.price != null ? `${offer.price.toFixed(2)} €` : ""}
                    {offer?.price != null && offer?.available_from ? " · " : ""}
                    {offer?.available_from && offer?.available_to ? `${offer.available_from} → ${offer.available_to}` : ""}
                  </div>
                )}
              </div>

              <div className="booking-card-details">
                <div>
                  <span>ID reserva</span>
                  <strong>{b._id.slice(-8).toUpperCase()}</strong>
                </div>
                <div>
                  <span>Cliente</span>
                  <strong>{b.client_dni}</strong>
                </div>
                <div>
                  <span>Próximo paso</span>
                  <strong>{isCancelled ? "Finalizada" : isPastBooking(b.date) ? "Valorar experiencia" : "Preparar llegada"}</strong>
                </div>
              </div>

              {!isCancelled && !isPastBooking(b.date) && (
                <div className="booking-mini-timeline">
                  <span className="is-done">Reserva</span>
                  <span className="is-done">Plaza</span>
                  <span>Experiencia</span>
                </div>
              )}

              {!isCancelled && (
                <button
                  className="btn-danger"
                  onClick={() => cancel(b._id)}
                  style={{ marginTop: "auto", padding: "10px 16px", fontSize: "0.88rem" }}
                >
                  Cancelar Reserva
                </button>
              )}
            </div>
          );
        })}
      </div>

      {previousBookings.length > 0 && (
        <section className="experience-strip anim-fade-in-up" style={{ marginTop: 32 }}>
          <div>
            <span className="eyebrow">Experiencias anteriores</span>
            <h2>Tu historial Hamari</h2>
          </div>
          <div className="experience-quotes">
            {previousBookings.slice(0, 3).map((booking) => (
              <blockquote key={booking._id}>
                {offerMap[booking.offer_id]?.title ?? "Experiencia Hamari"} · {booking.date}
              </blockquote>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
