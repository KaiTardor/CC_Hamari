import { useEffect, useState, useCallback } from "react";
import { api, getApiErrorMessage } from "../api";
import { useConfirm } from "../components/useConfirm";

type Client = { dni: string; name: string; surname: string; email: string; phone: string; sex?: string; birth_date?: string; };
type Provider = { dni: string; company_name: string; contact_name?: string; contact_surname?: string; email?: string; phone?: string; };
type Staff = { dni: string; name: string; surname: string; email: string; phone: string; sex?: string; birth_date?: string; };
type Tab = "clients" | "providers" | "staff";

export default function AdminUsersPage() {
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<Tab>("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const loadData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (activeTab === "clients") { const res = await api.get("/clients/"); setClients(res.data); }
      else if (activeTab === "providers") { const res = await api.get("/providers/"); setProviders(res.data); }
      else if (activeTab === "staff") { const res = await api.get("/staff/"); setStaff(res.data); }
    } catch (err: unknown) { setError(getApiErrorMessage(err, "Error al cargar datos")); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { void loadData(); }, [activeTab, loadData]);

  const handleDelete = async (dni: string) => {
    const label = activeTab === "clients" ? "cliente" : activeTab === "providers" ? "proveedor" : "empleado";
    const confirmed = await confirm({
      title: `Eliminar ${label}`,
      message: `¿Seguro que deseas eliminar este ${label}? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      const endpoint = activeTab === "clients" ? "/clients/" : activeTab === "providers" ? "/providers/" : "/staff/";
      await api.delete(`${endpoint}${dni}`);
      await loadData();
    } catch (err: unknown) { alert(getApiErrorMessage(err, "Error al eliminar")); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === "clients" ? "/clients/" : activeTab === "providers" ? "/providers/" : "/staff/";
      await api.post(endpoint, formData);
      const username = (formData.username as string) || (formData.dni as string);
      const password = (formData.password as string) || "123456";
      const role = activeTab === "providers" ? "provider" : activeTab === "staff" ? "staff" : "client";
      try { await api.post("/auth/users/create", { username, password, role, ref_dni: formData.dni as string }); }
      catch (userErr) { console.warn("Usuario podría ya existir:", userErr); }
      setShowForm(false); setFormData({}); await loadData();
    } catch (err: unknown) { alert(getApiErrorMessage(err, "Error al crear")); }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: 8, color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 500,
  };

  const tabs = [
    { key: "clients" as Tab, label: "Clientes" },
    { key: "providers" as Tab, label: "Proveedores" },
    { key: "staff" as Tab, label: "Personal" },
  ];

  type UserItem = Client | Provider | Staff;
  let data: UserItem[] = [];
  if (activeTab === "clients") data = clients;
  else if (activeTab === "providers") data = providers;
  else if (activeTab === "staff") data = staff;

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1 className="grad-text anim-fade-in-up" style={{
        marginBottom: 8, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontFamily: "var(--font-display)",
      }}>
        Gestión de Usuarios
      </h1>
      <p className="anim-fade-in-up delay-1" style={{ color: "var(--color-text-dim)", marginBottom: 28, fontSize: "0.95rem" }}>
        Administra clientes, proveedores y personal
      </p>

      {/* Tabs */}
      <div className="anim-fade-in-up delay-2" style={{
        display: "flex", gap: 4, marginBottom: 24,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? "var(--grad-brand)" : "transparent",
              color: activeTab === tab.key ? "#fff" : "var(--color-text-muted)",
              padding: "10px 24px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: activeTab === tab.key ? 600 : 400,
              borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
              border: "none",
              fontFamily: "var(--font-display)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ padding: "10px 20px" }}>
          + Crear {activeTab === "clients" ? "Cliente" : activeTab === "providers" ? "Proveedor" : "Personal"}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: "var(--radius-sm)" }} />)}
        </div>
      ) : error ? (
        <div style={{ color: "var(--color-magenta)", textAlign: "center", padding: 24, background: "rgba(255,45,117,0.05)", borderRadius: "var(--radius-sm)" }}>
          {error}
        </div>
      ) : data.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--color-text-dim)", marginTop: 32 }}>No hay registros</p>
      ) : (
        <div className="card anim-fade-in-up" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th style={{ padding: "14px 16px", textAlign: "left", color: "var(--color-cyan)", fontSize: "0.82rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>DNI</th>
                  {activeTab === "providers" ? (
                    <>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "var(--color-cyan)", fontSize: "0.82rem", fontWeight: 600 }}>Empresa</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "var(--color-cyan)", fontSize: "0.82rem", fontWeight: 600 }}>Contacto</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "var(--color-cyan)", fontSize: "0.82rem", fontWeight: 600 }}>Email</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "var(--color-cyan)", fontSize: "0.82rem", fontWeight: 600 }}>Teléfono</th>
                    </>
                  ) : (
                    <>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "var(--color-cyan)", fontSize: "0.82rem", fontWeight: 600 }}>Nombre</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "var(--color-cyan)", fontSize: "0.82rem", fontWeight: 600 }}>Apellidos</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "var(--color-cyan)", fontSize: "0.82rem", fontWeight: 600 }}>Email</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", color: "var(--color-cyan)", fontSize: "0.82rem", fontWeight: 600 }}>Teléfono</th>
                    </>
                  )}
                  <th style={{ padding: "14px 16px", textAlign: "left", color: "var(--color-cyan)", fontSize: "0.82rem", fontWeight: 600 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.dni} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "12px 16px", color: "var(--color-text-light)", fontSize: "0.88rem" }}>{item.dni}</td>
                    {activeTab === "providers" ? (
                      <>
                        <td style={{ padding: "12px 16px", color: "var(--color-text-light)", fontSize: "0.88rem" }}>{(item as Provider).company_name}</td>
                        <td style={{ padding: "12px 16px", color: "var(--color-text-muted)", fontSize: "0.88rem" }}>{(item as Provider).contact_name} {(item as Provider).contact_surname}</td>
                        <td style={{ padding: "12px 16px", color: "var(--color-text-muted)", fontSize: "0.88rem" }}>{(item as Provider).email || "-"}</td>
                        <td style={{ padding: "12px 16px", color: "var(--color-text-muted)", fontSize: "0.88rem" }}>{(item as Provider).phone || "-"}</td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: "12px 16px", color: "var(--color-text-light)", fontSize: "0.88rem" }}>{(item as Client | Staff).name}</td>
                        <td style={{ padding: "12px 16px", color: "var(--color-text-muted)", fontSize: "0.88rem" }}>{(item as Client | Staff).surname}</td>
                        <td style={{ padding: "12px 16px", color: "var(--color-text-muted)", fontSize: "0.88rem" }}>{(item as Client | Staff).email}</td>
                        <td style={{ padding: "12px 16px", color: "var(--color-text-muted)", fontSize: "0.88rem" }}>{(item as Client | Staff).phone}</td>
                      </>
                    )}
                    <td style={{ padding: "12px 16px" }}>
                      <button className="btn-danger" onClick={() => handleDelete(item.dni)} style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16,
          animation: "fadeIn 0.2s ease",
        }} onClick={() => setShowForm(false)}>
          <div className="card" style={{
            padding: 28, width: "min(92vw, 560px)", maxHeight: "85vh", overflowY: "auto",
            animation: "scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }} onClick={(e) => e.stopPropagation()}>
            <h2 className="grad-text" style={{
              marginBottom: 20, fontSize: "1.3rem", fontFamily: "var(--font-display)",
            }}>
              Crear {activeTab === "clients" ? "Cliente" : activeTab === "providers" ? "Proveedor" : "Personal"}
            </h2>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>DNI *</label>
                <input type="text" name="dni" placeholder="12345678A" required onChange={handleFormChange} />
              </div>

              {activeTab === "providers" ? (
                <>
                  <div><label style={labelStyle}>Nombre de empresa *</label><input type="text" name="company_name" required onChange={handleFormChange} /></div>
                  <div><label style={labelStyle}>Nombre de contacto</label><input type="text" name="contact_name" onChange={handleFormChange} /></div>
                  <div><label style={labelStyle}>Apellidos de contacto</label><input type="text" name="contact_surname" onChange={handleFormChange} /></div>
                  <div><label style={labelStyle}>Email</label><input type="email" name="email" onChange={handleFormChange} /></div>
                  <div><label style={labelStyle}>Teléfono</label><input type="tel" name="phone" onChange={handleFormChange} /></div>
                  <div><label style={labelStyle}>Usuario (opcional)</label><input type="text" name="username" onChange={handleFormChange} /></div>
                  <div><label style={labelStyle}>Contraseña (por defecto: 123456)</label><input type="password" name="password" onChange={handleFormChange} /></div>
                </>
              ) : (
                <>
                  <div><label style={labelStyle}>Nombre *</label><input type="text" name="name" required onChange={handleFormChange} /></div>
                  <div><label style={labelStyle}>Apellidos *</label><input type="text" name="surname" required onChange={handleFormChange} /></div>
                  <div><label style={labelStyle}>Email *</label><input type="email" name="email" required onChange={handleFormChange} /></div>
                  <div><label style={labelStyle}>Teléfono *</label><input type="tel" name="phone" required onChange={handleFormChange} /></div>
                  <div>
                    <label style={labelStyle}>Sexo (opcional)</label>
                    <select name="sex" onChange={handleFormChange}>
                      <option value="">Seleccionar...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                  </div>
                  <div><label style={labelStyle}>Fecha de nacimiento</label><input type="date" name="birth_date" onChange={handleFormChange} /></div>
                  {activeTab === "staff" && (
                    <>
                      <div><label style={labelStyle}>Usuario (opcional)</label><input type="text" name="username" onChange={handleFormChange} /></div>
                      <div><label style={labelStyle}>Contraseña (por defecto: 123456)</label><input type="password" name="password" onChange={handleFormChange} /></div>
                    </>
                  )}
                </>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ padding: "10px 24px" }}>Crear</button>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)} style={{ padding: "10px 24px" }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
