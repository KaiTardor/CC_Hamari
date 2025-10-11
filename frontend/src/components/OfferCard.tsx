import type { Offer } from "../api";

export default function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <h3 style={{ margin: 0 }}>{offer.title}</h3>
      <p style={{ color: "#555", marginTop: 6 }}>{offer.description}</p>
      <div>Precio: {offer.price.toFixed(2)} €</div>
      <div>Ventana: {offer.available_from} → {offer.available_to}</div>
      <div>Capacidad/día: {offer.daily_capacity}</div>
    </div>
  );
}
