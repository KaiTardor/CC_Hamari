import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ConfirmContext, type ConfirmOptions, type PendingConfirm } from "./confirmContext";

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = (value: boolean) => {
    pending?.resolve(value);
    setPending(null);
  };

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {pending && (
        <div className="confirm-backdrop" role="presentation" onClick={() => close(false)}>
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`confirm-icon confirm-icon-${pending.tone ?? "warning"}`} aria-hidden="true" />
            <h2 id="confirm-title">{pending.title}</h2>
            <p>{pending.message}</p>
            <div className="confirm-actions">
              <button className="btn-ghost" type="button" onClick={() => close(false)}>
                {pending.cancelLabel ?? "Cancelar"}
              </button>
              <button
                className={pending.tone === "danger" ? "btn-danger" : "btn-primary"}
                type="button"
                onClick={() => close(true)}
              >
                {pending.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
