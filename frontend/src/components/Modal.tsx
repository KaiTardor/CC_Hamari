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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-bg-card)",
          color: "var(--color-text-light)",
          borderRadius: "var(--radius-lg)",
          width: "min(92vw, 440px)",
          boxShadow: "var(--shadow-lg), 0 0 60px rgba(255,45,117,0.1)",
          border: "1px solid rgba(255,255,255,0.06)",
          animation: "scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <strong id="modal-title" className="grad-text" style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            fontWeight: 700,
          }}>
            {title ?? "Aviso"}
          </strong>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "var(--radius-sm)",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              cursor: "pointer",
              color: "var(--color-text-muted)",
              transition: "all 0.2s ease",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 20, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          {children}
        </div>
        <div style={{
          padding: "14px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
        }}>
          {showLogin && onLogin && (
            <button className="btn-primary" onClick={onLogin} style={{ padding: "10px 20px" }}>
              Ir a Login
            </button>
          )}
          <button className="btn-ghost" onClick={onClose} style={{ padding: "10px 20px" }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
