import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones del frontend
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
      const { confirmPassword, ...dataToSend } = formData;
      const response = await api.post("/auth/register", dataToSend);
      
      // El backend devuelve token y user, así que auto-logeamos
      const { token } = response.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Redirigir al home
      navigate("/");
      window.location.reload(); // Para actualizar el AuthContext
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al registrarse. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
              Usuario *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
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
              DNI *
            </label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
              placeholder="12345678A"
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
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
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
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
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
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
              Nombre *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              Apellidos *
            </label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
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
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
              Teléfono *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+34600123456"
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
              Sexo (opcional)
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255, 45, 117, 0.3)",
                background: "var(--color-bg-card)",
                color: "var(--color-text-light)",
                fontSize: "1rem",
              }}
            >
              <option value="">Seleccionar...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--color-text-light)", fontSize: "0.9rem" }}>
            Fecha de Nacimiento (opcional)
          </label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
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
          disabled={loading}
          style={{
            marginTop: 8,
            padding: "12px 24px",
            fontSize: "1.1rem",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Registrando..." : "Crear Cuenta"}
        </button>

        <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginTop: 8 }}>
          ¿Ya tienes cuenta?{" "}
          <a href="/login" style={{ color: "var(--color-cyan)", textDecoration: "none" }}>
            Inicia sesión aquí
          </a>
        </p>
      </form>
    </div>
  );
}
