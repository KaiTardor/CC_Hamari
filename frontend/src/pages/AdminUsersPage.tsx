import { useEffect, useState } from "react";
import { api } from "../api";

type Client = {
  dni: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  sex?: string;
  birth_date?: string;
};

type Provider = {
  dni: string;
  company_name: string;
  contact_name?: string;
  contact_surname?: string;
  email?: string;
  phone?: string;
};

type Staff = {
  dni: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  sex?: string;
  birth_date?: string;
};

type Tab = "clients" | "providers" | "staff" | "users";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados para formulario de creación
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "clients") {
        const res = await api.get("/clients/");
        setClients(res.data);
      } else if (activeTab === "providers") {
        const res = await api.get("/providers/");
        setProviders(res.data);
      } else if (activeTab === "staff") {
        const res = await api.get("/staff/");
        setStaff(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dni: string) => {
    if (!confirm(`¿Seguro que deseas eliminar este ${activeTab === "clients" ? "cliente" : activeTab === "providers" ? "proveedor" : "empleado"}?`)) return;
    
    try {
      const endpoint = activeTab === "clients" ? "/clients/" : activeTab === "providers" ? "/providers/" : "/staff/";
      await api.delete(`${endpoint}${dni}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al eliminar");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === "clients" ? "/clients/" : activeTab === "providers" ? "/providers/" : "/staff/";
      await api.post(endpoint, formData);
      
      // Crear usuario también si es proveedor o staff
      if (activeTab === "providers" || activeTab === "staff") {
        const username = formData.username || formData.dni;
        const password = formData.password || "123456"; // Contraseña temporal
        const role = activeTab === "providers" ? "provider" : "staff";
        
        try {
          await api.post("/users/create", {
            username,
            password,
            role,
            ref_dni: formData.dni
          });
        } catch (userErr) {
          console.warn("Usuario podría ya existir:", userErr);
        }
      }
      
      setShowForm(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al crear");
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderForm = () => {
    if (!showForm) return null;

    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }} onClick={() => setShowForm(false)}>
        <div style={{
          background: "var(--color-bg-card)",
          borderRadius: 12,
          padding: 24,
          width: "min(92vw, 600px)",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "2px solid var(--color-magenta)",
        }} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ color: "var(--color-cyan)", marginBottom: 16 }}>
            Crear {activeTab === "clients" ? "Cliente" : activeTab === "providers" ? "Proveedor" : "Personal"}
          </h2>

          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Campos comunes */}
            <input
              type="text"
              name="dni"
              placeholder="DNI *"
              required
              onChange={handleFormChange}
              style={inputStyle}
            />

            {activeTab === "providers" ? (
              <>
                <input type="text" name="company_name" placeholder="Nombre de empresa *" required onChange={handleFormChange} style={inputStyle} />
                <input type="text" name="contact_name" placeholder="Nombre de contacto" onChange={handleFormChange} style={inputStyle} />
                <input type="text" name="contact_surname" placeholder="Apellidos de contacto" onChange={handleFormChange} style={inputStyle} />
                <input type="email" name="email" placeholder="Email" onChange={handleFormChange} style={inputStyle} />
                <input type="tel" name="phone" placeholder="Teléfono" onChange={handleFormChange} style={inputStyle} />
                <input type="text" name="username" placeholder="Usuario (opcional, se usará DNI por defecto)" onChange={handleFormChange} style={inputStyle} />
                <input type="password" name="password" placeholder="Contraseña (por defecto: 123456)" onChange={handleFormChange} style={inputStyle} />
              </>
            ) : (
              <>
                <input type="text" name="name" placeholder="Nombre *" required onChange={handleFormChange} style={inputStyle} />
                <input type="text" name="surname" placeholder="Apellidos *" required onChange={handleFormChange} style={inputStyle} />
                <input type="email" name="email" placeholder="Email *" required onChange={handleFormChange} style={inputStyle} />
                <input type="tel" name="phone" placeholder="Teléfono *" required onChange={handleFormChange} style={inputStyle} />
                <select name="sex" onChange={handleFormChange} style={inputStyle}>
                  <option value="">Sexo (opcional)</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
                <input type="date" name="birth_date" placeholder="Fecha de nacimiento" onChange={handleFormChange} style={inputStyle} />
                
                {activeTab === "staff" && (
                  <>
                    <input type="text" name="username" placeholder="Usuario (opcional, se usará DNI por defecto)" onChange={handleFormChange} style={inputStyle} />
                    <input type="password" name="password" placeholder="Contraseña (por defecto: 123456)" onChange={handleFormChange} style={inputStyle} />
                  </>
                )}
              </>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="submit">Crear</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "1px solid var(--color-text-muted)" }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (loading) return <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Cargando...</p>;
    if (error) return <p style={{ textAlign: "center", color: "var(--color-magenta)" }}>{error}</p>;

    let data: any[] = [];
    if (activeTab === "clients") data = clients;
    else if (activeTab === "providers") data = providers;
    else if (activeTab === "staff") data = staff;

    if (data.length === 0) {
      return <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginTop: 24 }}>No hay registros</p>;
    }

    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--color-magenta)" }}>
              <th style={thStyle}>DNI</th>
              {activeTab === "providers" ? (
                <>
                  <th style={thStyle}>Empresa</th>
                  <th style={thStyle}>Contacto</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Teléfono</th>
                </>
              ) : (
                <>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Apellidos</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Teléfono</th>
                </>
              )}
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.dni} style={{ borderBottom: "1px solid rgba(255, 45, 117, 0.2)" }}>
                <td style={tdStyle}>{item.dni}</td>
                {activeTab === "providers" ? (
                  <>
                    <td style={tdStyle}>{item.company_name}</td>
                    <td style={tdStyle}>{item.contact_name} {item.contact_surname}</td>
                    <td style={tdStyle}>{item.email || "-"}</td>
                    <td style={tdStyle}>{item.phone || "-"}</td>
                  </>
                ) : (
                  <>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={tdStyle}>{item.surname}</td>
                    <td style={tdStyle}>{item.email}</td>
                    <td style={tdStyle}>{item.phone}</td>
                  </>
                )}
                <td style={tdStyle}>
                  <button
                    onClick={() => handleDelete(item.dni)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--color-magenta)",
                      color: "var(--color-magenta)",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: "32px 0" }}>
      <h1 style={{
        background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: 24,
      }}>
        Gestión de Usuarios
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "2px solid rgba(255, 45, 117, 0.3)" }}>
        {[
          { key: "clients" as Tab, label: "Clientes" },
          { key: "providers" as Tab, label: "Proveedores" },
          { key: "staff" as Tab, label: "Personal" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? "linear-gradient(135deg, var(--color-magenta), var(--color-orange))" : "transparent",
              border: "none",
              color: activeTab === tab.key ? "#fff" : "var(--color-text-muted)",
              padding: "12px 24px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: activeTab === tab.key ? 600 : 400,
              borderRadius: "8px 8px 0 0",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Botón crear */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setShowForm(true)}>
          + Crear {activeTab === "clients" ? "Cliente" : activeTab === "providers" ? "Proveedor" : "Personal"}
        </button>
      </div>

      {/* Tabla */}
      {renderTable()}

      {/* Formulario modal */}
      {renderForm()}
    </div>
  );
}

// Estilos reutilizables
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255, 45, 117, 0.3)",
  background: "var(--color-bg-dark)",
  color: "var(--color-text-light)",
  fontSize: "1rem",
};

const thStyle: React.CSSProperties = {
  padding: "12px 8px",
  textAlign: "left",
  color: "var(--color-cyan)",
  fontSize: "0.9rem",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 8px",
  color: "var(--color-text-light)",
  fontSize: "0.9rem",
};
