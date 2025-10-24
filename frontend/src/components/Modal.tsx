import React from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  showLogin?: boolean;
  onLogin?: () => void;
};

export default function Modal({ open, title, onClose, children, showLogin, onLogin }: ModalProps) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-bg-card)",
          color: "var(--color-text-light)",
          borderRadius: 12,
          width: "min(92vw, 420px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          border: "2px solid var(--color-magenta)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(255, 45, 117, 0.3)" }}>
          <strong id="modal-title" style={{ background: "linear-gradient(135deg, #ff2d75, #ff9933)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{title ?? "Aviso"}</strong>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--color-text-light)" }}>×</button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
        <div style={{ padding: 12, borderTop: "1px solid rgba(255, 45, 117, 0.3)", textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {showLogin && onLogin && (
            <button onClick={onLogin} style={{ background: "linear-gradient(135deg, #00d4ff, #ff2d75)" }}>Ir a Login</button>
          )}
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--color-text-muted)", color: "var(--color-text-light)" }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
