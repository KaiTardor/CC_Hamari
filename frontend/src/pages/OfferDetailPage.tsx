import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchOffer, type Offer } from "../api";
import BookingModal from "../components/BookingModal";

export default function OfferDetailPage() {
  const { id } = useParams();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { if (id) fetchOffer(id).then(setOffer).catch(() => setOffer(null)); }, [id]);
  if (!offer) return <div className="container">Cargando…</div>;

  return (
    <div className="container">
      <h1>{offer.title}</h1>
      <p style={{ color: "#555" }}>{offer.description}</p>
      <div>Precio: {offer.price.toFixed(2)} €</div>
      <div>Ventana: {offer.available_from} → {offer.available_to}</div>
      <div>Capacidad/día: {offer.daily_capacity}</div>

      <button className="btn" style={{ marginTop: 12 }} onClick={() => setOpen(true)}>Reservar</button>
      {open && <BookingModal offerId={offer._id} onClose={() => setOpen(false)} />}
    </div>
  );
}
