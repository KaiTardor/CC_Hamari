import axios from "axios";

const RAW_BASE = (import.meta.env.VITE_API_BASE ?? "").trim();

const API_BASE =
  RAW_BASE === ""
    ? "/api"
    : RAW_BASE.endsWith("/api")
      ? RAW_BASE
      : RAW_BASE.replace(/\/+$/, "") + "/api";

console.log("RAW_BASE =", JSON.stringify(RAW_BASE));
console.log("API_BASE =", API_BASE);

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  console.log(
    "[API REQUEST]",
    "baseURL =", config.baseURL,
    "url =", config.url
  );
  return config;
});
 
export type Offer = {
  _id: string;
  provider_dni: string;
  title: string;
  description: string;
  price: number;
  people_included?: number;
  available_from: string; // "DD/MM/AAAA"
  available_to: string;   // "DD/MM/AAAA"
  daily_capacity: number;
  is_active: boolean;
};

export type Booking = {
  _id: string;
  offer_id: string;
  client_dni: string;
  date: string; // DD/MM/AAAA
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
};

export const fetchOffers = async (params?: { q?: string; date?: string }) =>
  (await api.get<Offer[]>("/offers/", { params })).data;

export const fetchOffer = async (id: string) =>
  (await api.get<Offer>(`/offers/${id}`)).data;

export const fetchAvailability = async (id: string, date: string) =>
  (await api.get(`/offers/${id}/availability`, { params: { date } })).data;

export const createBooking = async (p: { offer_id: string; client_dni: string; date: string }) =>
  (await api.post("/bookings/", p)).data;

export const fetchBookings = async (dni: string) =>
  (await api.get<Booking[]>("/bookings/", { params: { dni } })).data;

export const cancelBooking = async (id: string) =>
  (await api.patch(`/bookings/${id}/status`, { status: "CANCELLED" })).data;

export const createOffer = async (payload: {
  provider_dni: string;
  title: string;
  description: string;
  price: number;
  people_included?: number;
  available_from: string;
  available_to: string;
  daily_capacity: number;
  is_active?: boolean;
}) => (await api.post("/offers/", payload)).data;