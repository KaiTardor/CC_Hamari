import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      nav("/");
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
    <div className="container" style={{
      padding: "64px 0",
      maxWidth: 480,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <div className="card anim-fade-in-up" style={{
        padding: "40px 36px",
        width: "100%",
      }}>
        <h1 className="grad-text" style={{
          marginBottom: 8,
          textAlign: "center",
          fontSize: "1.8rem",
          fontFamily: "var(--font-display)",
        }}>
          Iniciar Sesión
        </h1>
        <p style={{
          textAlign: "center",
          color: "var(--color-text-dim)",
          marginBottom: 32,
          fontSize: "0.95rem",
        }}>
          Accede a tu cuenta de Hamari
        </p>

        {msg && (
          <div style={{
            background: "rgba(255, 45, 117, 0.08)",
            border: "1px solid rgba(255,45,117,0.2)",
            borderRadius: "var(--radius-sm)",
            padding: 14,
            marginBottom: 20,
            color: "var(--color-magenta)",
            fontSize: "0.9rem",
          }}>
            {msg}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{
              display: "block",
              marginBottom: 8,
              color: "var(--color-text-muted)",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}>
              Usuario
            </label>
            <input
              placeholder="Usuario o email"
              value={username}
              onChange={e=>setU(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{
              display: "block",
              marginBottom: 8,
              color: "var(--color-text-muted)",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}>
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e=>setP(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={busy}
            style={{
              marginTop: 8,
              padding: "14px 24px",
              fontSize: "1.05rem",
              width: "100%",
            }}
          >
            {busy ? "Entrando..." : "Entrar"}
          </button>

          <p style={{
            textAlign: "center",
            color: "var(--color-text-dim)",
            marginTop: 8,
            fontSize: "0.9rem",
          }}>
            ¿No tienes cuenta?{" "}
            <Link to="/register" style={{ color: "var(--color-cyan)", fontWeight: 500 }}>
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
