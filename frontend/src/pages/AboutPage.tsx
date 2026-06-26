export default function AboutPage() {
  const founders = [
    { name: "Mario Casas", role: "Fundador", img: "/mc.jpg", color: "var(--color-magenta)", border: "rgba(255,45,117,0.3)", desc: "Jefe del departamento de diseño web, experiencia de usuario y marketing digital." },
    { name: "Marina Ruiz", role: "CEO & Co-fundador", img: "/mr.jpg", color: "var(--color-cyan)", border: "rgba(0,212,255,0.3)", desc: "Experta en tecnología y portavoz de la empresa." },
    { name: "Haowei Hu", role: "Co-fundador", img: "/hh.jpg", color: "var(--color-orange)", border: "rgba(255,153,51,0.3)", desc: "Especialista en IA y atención al cliente." },
  ];

  return (
    <div className="container" style={{ padding: "48px 0", maxWidth: 900 }}>
      <h1 className="grad-text anim-fade-in-up" style={{
        marginBottom: 8,
        fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
        fontFamily: "var(--font-display)",
      }}>
        Sobre Nosotros
      </h1>
      <p className="anim-fade-in-up delay-1" style={{ color: "var(--color-text-dim)", marginBottom: 40, fontSize: "1rem" }}>
        Conoce la historia y el equipo detrás de Hamari
      </p>

      {/* Mission */}
      <section className="card anim-fade-in-up delay-1" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ color: "var(--color-cyan)", fontSize: "1.4rem", marginBottom: 12, fontFamily: "var(--font-display)" }}>
          Nuestra Misión
        </h2>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.8 }}>
          Ofrecer a cualquier usuario experiencias únicas e inolvidables mediante paquetes sorpresa personalizados que se adapten a sus gustos,
          preferencias y estilos de vida, consiguiéndolo mediante alianzas con empresas de distintos sectores como ocio, turismo, gastronomía
          o bienestar.
        </p>
      </section>

      {/* Vision */}
      <section className="card anim-fade-in-up delay-2" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ color: "var(--color-magenta)", fontSize: "1.4rem", marginBottom: 12, fontFamily: "var(--font-display)" }}>
          Nuestra Visión
        </h2>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.8 }}>
          Conseguir que nuestro negocio se expanda internacionalmente, consiguiendo que sea una marca reconocida.
        </p>
      </section>

      {/* Objectives */}
      <section className="card anim-fade-in-up delay-3" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ color: "var(--color-orange)", fontSize: "1.4rem", marginBottom: 16, fontFamily: "var(--font-display)" }}>
          Nuestros Objetivos
        </h2>
        <ul style={{ color: "var(--color-text-muted)", lineHeight: 1.8, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <li>Desarrollar un sistema inteligente eficaz en los primeros seis meses que permita asignar a cada usuario un plan sorpresa altamente personalizado.</li>
          <li>Establecer convenios con al menos 50 empresas colaboradoras del ámbito del ocio, turismo, gastronomía y bienestar en el primer año.</li>
          <li>Conseguir un índice de satisfacción del cliente superior al 90% mediante nuestros productos memorables.</li>
          <li>Aumentar la base de clientes en un 20% cada año hasta estabilizar nuestra clientela.</li>
        </ul>
      </section>

      {/* Team */}
      <section className="anim-fade-in-up delay-4" style={{ marginBottom: 32 }}>
        <h2 className="grad-text" style={{
          fontSize: "1.4rem",
          marginBottom: 12,
          fontFamily: "var(--font-display)",
        }}>
          Quiénes Somos
        </h2>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.8, marginBottom: 28, fontSize: "1rem" }}>
          Somos un equipo formados por informáticos apasionados por conectar personas con experiencias únicas.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}>
          {founders.map((f, i) => (
            <div
              key={f.name}
              className="card anim-fade-in-up"
              style={{
                padding: 28,
                textAlign: "center",
                animationDelay: `${0.15 + i * 0.1}s`,
              }}
            >
              <div style={{
                width: 130,
                height: 130,
                borderRadius: "50%",
                border: `3px solid ${f.border}`,
                margin: "0 auto 18px",
                overflow: "hidden",
                boxShadow: `0 0 24px ${f.border}`,
              }}>
                <img src={f.img} alt={f.name} style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }} />
              </div>
              <h3 style={{
                color: f.color,
                fontSize: "1.2rem",
                marginBottom: 6,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
              }}>
                {f.name}
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: 12, fontWeight: 500 }}>
                {f.role}
              </p>
              <p style={{ color: "var(--color-text-dim)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Hamari */}
      <section className="card anim-fade-in-up delay-5" style={{ padding: 32 }}>
        <h2 style={{ color: "var(--color-magenta)", fontSize: "1.4rem", marginBottom: 12, fontFamily: "var(--font-display)" }}>
          ¿Por qué Hamari?
        </h2>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.8 }}>
          La actividad principal a la que se va a dedicar nuestra empresa es ofrecer experiencias sorpresa asequibles a los usuarios
          (en base a encuestas que éstos han de rellenar para adaptar su experiencia), consiguiendo que éstos puedan sentir y
          disfrutar de momentos inolvidables.
        </p>
      </section>
    </div>
  );
}
