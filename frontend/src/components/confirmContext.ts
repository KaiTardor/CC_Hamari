import { createContext } from "react";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning";
};

export type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void };

export const ConfirmContext = createContext<{ confirm: (options: ConfirmOptions) => Promise<boolean> } | null>(null);
