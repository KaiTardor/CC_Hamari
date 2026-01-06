import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    dni: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    sex: "",
    birth_date: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { username, password, dni, name, surname, email, phone, sex, birth_date } =
        formData;

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
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- estilos reutilizables (anti-solape) ---
  const fieldLabelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 6,
    color: "var(--color-text-light)",
    fontSize: "0.9rem",
  };

  const fieldControlStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255, 45, 117, 0.3)",
    background: "var(--color-bg-card)",
    color: "var(--color-text-light)",
    fontSize: "1rem",
  };

  const grid2Style: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: 16,
  };

  const fieldWrapStyle: React.CSSProperties = { minWidth: 0 };

  return (
    <div className="container" style={{ padding: "32px 0", maxWidth: 600 }}>
      <h1
        style={{
          background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Crear Cuenta
      </h1>

      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: 24 }}>
        Regístrate como cliente para acceder a todas las funcionalidades
      </p>

      {error && (
        <div
          style={{
            background: "rgba(255, 45, 117, 0.1)",
            border: "1px solid var(--color-magenta)",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            color: "var(--color-magenta)",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Usuario / DNI */}
        <div style={grid2Style}>
          <div style={fieldWrapStyle}>
            <label style={fieldLabelStyle}>Usuario *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={fieldControlStyle}
            />
          </div>

          <div style={fieldWrapStyle}>
            <label style={fieldLabelStyle}>DNI *</label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
              placeholder="12345678A"
              style={fieldControlStyle}
            />
          </div>
        </div>

        {/* Password / Confirm */}
        <div style={grid2Style}>
          <div style={fieldWrapStyle}>
            <label style={fieldLabelStyle}>Contraseña *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={fieldControlStyle}
            />
          </div>

          <div style={fieldWrapStyle}>
            <label style={fieldLabelStyle}>Confirmar Contraseña *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              style={fieldControlStyle}
            />
          </div>
        </div>

        {/* Nombre / Apellidos */}
        <div style={grid2Style}>
          <div style={fieldWrapStyle}>
            <label style={fieldLabelStyle}>Nombre *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={fieldControlStyle}
            />
          </div>

          <div style={fieldWrapStyle}>
            <label style={fieldLabelStyle}>Apellidos *</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              required
              style={fieldControlStyle}
            />
          </div>
        </div>

        {/* Email */}
        <div style={fieldWrapStyle}>
          <label style={fieldLabelStyle}>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={fieldControlStyle}
          />
        </div>

        {/* Teléfono / Sexo */}
        <div style={grid2Style}>
          <div style={fieldWrapStyle}>
            <label style={fieldLabelStyle}>Teléfono *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+34600123456"
              style={fieldControlStyle}
            />
          </div>

          <div style={fieldWrapStyle}>
            <label style={fieldLabelStyle}>Sexo (opcional)</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              style={fieldControlStyle}
            >
              <option value="">Seleccionar...</option>
              <option value="M">Hombre</option>
              <option value="F">Mujer</option>
              <option value="O">Otro</option>
            </select>
          </div>
        </div>

        {/* Birth date */}
        <div style={fieldWrapStyle}>
          <label style={fieldLabelStyle}>Fecha de Nacimiento (opcional)</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            style={fieldControlStyle}
          />
        </div>

        {/* Botón + login */}
        <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 24px",
              fontSize: "1.1rem",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%",
              position: "relative",
              zIndex: 1,
            }}
          >
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>

          <p style={{ textAlign: "center", color: "var(--color-text-muted)", margin: 0 }}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" style={{ color: "var(--color-cyan)", textDecoration: "none" }}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
