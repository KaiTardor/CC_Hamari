import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setBusy(true);
    try {
      await login(username, password);
      nav("/"); // a home
    } catch (err: unknown) {
      type AxiosLike = { response?: { data?: { error?: string } }; message?: string };
      let message = "No se pudo iniciar sesión";
      if (err && typeof err === "object") {
        const ae = err as AxiosLike;
        message = ae.response?.data?.error ?? ae.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setMsg(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ padding: "32px 0", maxWidth: 500 }}>
      <h1 style={{
        background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: 8,
        textAlign: "center",
      }}>
        Iniciar Sesión
      </h1>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: 24 }}>
        Accede a tu cuenta de Hamari
      </p>

      {msg && (
        <div style={{
          background: "rgba(255, 45, 117, 0.1)",
          border: "1px solid var(--color-magenta)",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          color: "var(--color-magenta)",
        }}>
          {msg}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
            Usuario
          </label>
          <input
            placeholder="Usuario o email"
            value={username}
            onChange={e=>setU(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255, 45, 117, 0.3)",
              background: "var(--color-bg-card)",
              color: "var(--color-text-light)",
              fontSize: "1rem",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
            Contraseña
          </label>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e=>setP(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255, 45, 117, 0.3)",
              background: "var(--color-bg-card)",
              color: "var(--color-text-light)",
              fontSize: "1rem",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 8,
            padding: "12px 24px",
            fontSize: "1.1rem",
            opacity: busy ? 0.6 : 1,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Entrando..." : "Entrar"}
        </button>

        <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginTop: 8 }}>
          ¿No tienes cuenta?{" "}
          <a href="/register" style={{ color: "var(--color-cyan)", textDecoration: "none" }}>
            Regístrate aquí
          </a>
        </p>
      </form>
    </div>
  );
}
