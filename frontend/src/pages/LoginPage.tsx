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
    } catch (e: any) {
      setMsg(e?.response?.data?.error ?? "No se pudo iniciar sesión");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h1>Iniciar sesión</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
        <input className="input" placeholder="Usuario (email o DNI)" value={username} onChange={e=>setU(e.target.value)} />
        <input className="input" placeholder="Contraseña" type="password" value={password} onChange={e=>setP(e.target.value)} />
        <button className="btn" disabled={busy}>Entrar</button>
      </form>
      {msg && <div style={{ marginTop: 8, color: "red" }}>{msg}</div>}

      <div style={{ marginTop: 16 }}>
        <b>Usuarios demo:</b>
        <ul>
          <li>admin@hamari.com / <code>admin123</code></li>
          <li>23456789C / <code>provider123</code></li>
          <li>34567890D / <code>staff123</code></li>
          <li>12345678A / <code>client123</code></li>
        </ul>
      </div>
    </div>
  );
}
