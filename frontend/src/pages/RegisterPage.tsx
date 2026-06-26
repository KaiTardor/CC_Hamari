import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "", password: "", confirmPassword: "", dni: "",
    name: "", surname: "", email: "", phone: "", sex: "", birth_date: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden"); return;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres"); return;
    }
    setLoading(true);
    try {
      const { username, password, dni, name, surname, email, phone, sex, birth_date } = formData;
      const dataToSend = { username, password, dni, name, surname, email, phone, sex, birth_date };
      const response = await api.post("/auth/register", dataToSend);
      const { token } = response.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      navigate("/");
      window.location.reload();
    } catch (err: unknown) {
      type AxiosErr = { response?: { data?: { error?: string } }; message?: string };
      let message = "Error al registrarse. Inténtalo de nuevo.";
      if (err && typeof err === "object") {
        const ae = err as AxiosErr;
        message = ae.response?.data?.error ?? ae.message ?? message;
      } else if (err instanceof Error) { message = err.message; }
      setError(message);
    } finally { setLoading(false); }
  };

  const grid2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: 16,
  };
  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: 8,
    color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 500,
  };

  return (
    <div className="container" style={{ padding: "48px 0", maxWidth: 580 }}>
      <div className="card anim-fade-in-up" style={{ padding: "40px 36px" }}>
        <h1 className="grad-text" style={{
          marginBottom: 8, textAlign: "center", fontSize: "1.8rem",
          fontFamily: "var(--font-display)",
        }}>
          Crear Cuenta
        </h1>
        <p style={{ textAlign: "center", color: "var(--color-text-dim)", marginBottom: 32, fontSize: "0.95rem" }}>
          Regístrate como cliente para acceder a todas las funcionalidades
        </p>

        {error && (
          <div style={{
            background: "rgba(255, 45, 117, 0.08)",
            border: "1px solid rgba(255,45,117,0.2)",
            borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 20,
            color: "var(--color-magenta)", fontSize: "0.9rem",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={grid2}>
            <div>
              <label style={labelStyle}>Usuario *</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div>
              <label style={labelStyle}>DNI *</label>
              <input type="text" name="dni" value={formData.dni} onChange={handleChange} required placeholder="12345678A" />
            </div>
          </div>

          <div style={grid2}>
            <div>
              <label style={labelStyle}>Contraseña *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
            </div>
            <div>
              <label style={labelStyle}>Confirmar Contraseña *</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} />
            </div>
          </div>

          <div style={grid2}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label style={labelStyle}>Apellidos *</label>
              <input type="text" name="surname" value={formData.surname} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div style={grid2}>
            <div>
              <label style={labelStyle}>Teléfono *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+34600123456" />
            </div>
            <div>
              <label style={labelStyle}>Sexo (opcional)</label>
              <select name="sex" value={formData.sex} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                <option value="M">Hombre</option>
                <option value="F">Mujer</option>
                <option value="O">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Fecha de Nacimiento (opcional)</label>
            <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: 8, padding: "14px 24px", fontSize: "1.05rem", width: "100%" }}
          >
            {loading ? (
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Creando cuenta
                <span className="loading-dots" aria-hidden="true"><span /><span /><span /></span>
              </span>
            ) : "Crear Cuenta"}
          </button>

          <p style={{ textAlign: "center", color: "var(--color-text-dim)", margin: 0, fontSize: "0.9rem" }}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" style={{ color: "var(--color-cyan)", fontWeight: 500 }}>
              Inicia sesión aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
