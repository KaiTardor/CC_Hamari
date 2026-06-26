import { createContext } from "react";

export type ToastTone = "success" | "warning" | "danger";
export type ToastInput = { tone: ToastTone; title: string; message: string };
export type ToastItem = ToastInput & { id: number };

export const ToastContext = createContext<{ showToast: (toast: ToastInput) => void } | null>(null);
