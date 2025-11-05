export default function AboutPage() {
  return (
    <div className="container" style={{ padding: "32px 0", maxWidth: 900 }}>
      <h1 style={{ 
        background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)", 
        WebkitBackgroundClip: "text", 
        WebkitTextFillColor: "transparent", 
        backgroundClip: "text",
        marginBottom: 24
      }}>
        Sobre Nosotros
      </h1>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "var(--color-cyan)", fontSize: "1.5rem", marginBottom: 12 }}>Nuestra Misión</h2>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.8 }}>
          Ofrecer  a cualquier usuario experiencias únicas e inolvidables mediante paquetes sorpresa personalizados que se adapten a sus gustos, 
          preferencias y estilos de vida, consiguiéndolo mediante alianzas con empresas de distintos sectores como ocio, turismo, gastronomía 
          o bienestar.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "var(--color-magenta)", fontSize: "1.5rem", marginBottom: 12 }}>Nuestra Visión</h2>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.8 }}>
          Conseguir que nuestro negocio se expanda internacionalmente, consiguiendo que sea una marca reconocida.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "var(--color-orange)", fontSize: "1.5rem", marginBottom: 12 }}>Nuestros Objetivos</h2>
        <ul style={{ color: "var(--color-text-muted)", lineHeight: 1.8, paddingLeft: 20 }}>
          <li>Desarrollar un sistema inteligente eficaz en los primeros seis meses que permita asignar a cada usuario un 
            plan sorpresa altamente personalizado, basándonos en la información recogida a través de nuestros cuestionarios.</li>
          <li>Establecer convenios con al menos 50 empresas colaboradoras del ámbito del ocio, turismo, gastronomía y bienestar en el primer año.</li>
          <li>Conseguir un índice de satisfacción del cliente superior al 90% mediante nuestros productos memorables, 
            la atención al cliente cercana y un seguimiento tras la experiencia para saber cómo mejorar.</li>
          <li>Aumentar la base de clientes en un 20% cada año hasta estabilizar nuestra clientela, garantizando un crecimiento progresivo 
            sin perder la calidad y personalización del servicio.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 48 }}>
        <h2 style={{ 
          background: "linear-gradient(135deg, #ff2d75, #ff9933)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontSize: "1.5rem", 
          marginBottom: 12,
        }}>
          Quiénes Somos
        </h2>

        <p style={{ 
          color: "var(--color-text-muted)", 
          lineHeight: 1.8, 
          marginBottom: 32,
          fontSize: "1.05rem",
        }}>
          Somos un equipo formados por informáticos apasionados por conectar personas con experiencias únicas. 
          Conoce a los fundadores que hacen posible Hamari:
        </p>
        
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: 24,
          marginBottom: 16,
        }}>
          {/* Fundador 1 */}
          <div style={{
            background: "var(--color-bg-card)",
            borderRadius: 12,
            padding: 24,
            border: "2px solid rgba(255, 45, 117, 0.3)",
            textAlign: "center",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 45, 117, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}>
            <div style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              border: "3px solid var(--color-magenta)",
              margin: "0 auto 16px",
              overflow: "hidden",
            }}>
              <img 
                src="/mc.jpg" 
                alt="Mario Casas"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <h3 style={{ 
              color: "var(--color-magenta)", 
              fontSize: "1.3rem", 
              marginBottom: 8,
              fontWeight: 700,
            }}>
              Mario Casas
            </h3>
            <p style={{ 
              color: "var(--color-cyan)", 
              fontSize: "0.95rem", 
              marginBottom: 12,
              fontWeight: 600,
            }}>
              Fundador
            </p>
            <p style={{ 
              color: "var(--color-text-muted)", 
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}>
              Jefe del departamento de diseño web, experiencia de usuario y marketing digital.
            </p>
          </div>

          {/* Fundador 2 */}
          <div style={{
            background: "var(--color-bg-card)",
            borderRadius: 12,
            padding: 24,
            border: "2px solid rgba(0, 212, 255, 0.3)",
            textAlign: "center",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 212, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}>
            <div style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              border: "3px solid var(--color-cyan)",
              margin: "0 auto 16px",
              overflow: "hidden",
            }}>
              <img 
                src="/mr.jpg" 
                alt="Marina Ruiz"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <h3 style={{ 
              color: "var(--color-cyan)", 
              fontSize: "1.3rem", 
              marginBottom: 8,
              fontWeight: 700,
            }}>
              Marina Ruiz
            </h3>
            <p style={{ 
              color: "var(--color-orange)", 
              fontSize: "0.95rem", 
              marginBottom: 12,
              fontWeight: 600,
            }}>
              CEO & Co-fundador
            </p>
            <p style={{ 
              color: "var(--color-text-muted)", 
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}>
              Experta en tecnología y portavoz de la empresa.
            </p>
          </div>

          {/* Fundador 3 */}
          <div style={{
            background: "var(--color-bg-card)",
            borderRadius: 12,
            padding: 24,
            border: "2px solid rgba(255, 153, 51, 0.3)",
            textAlign: "center",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 153, 51, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}>
            <div style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              border: "3px solid var(--color-orange)",
              margin: "0 auto 16px",
              overflow: "hidden",
            }}>
              <img 
                src="/hh.jpg" 
                alt="Haowei Hu"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <h3 style={{ 
              color: "var(--color-orange)", 
              fontSize: "1.3rem", 
              marginBottom: 8,
              fontWeight: 700,
            }}>
              Haowei Hu
            </h3>
            <p style={{ 
              color: "var(--color-magenta)", 
              fontSize: "0.95rem", 
              marginBottom: 12,
              fontWeight: 600,
            }}>
              Co-fundador
            </p>
            <p style={{ 
              color: "var(--color-text-muted)", 
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}>
              Especialista en IA y atención al cliente.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ color: "var(--color-magenta)", fontSize: "1.5rem", marginBottom: 12 }}>¿Por qué Hamari?</h2>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.8 }}>
          La actividad principal a la que se va a dedicar nuestra empresa es ofrecer experiencias sorpresa asequibles a los usuarios 
          (en base a encuestas que éstos han de rellenar para adaptar su experiencia), consiguiendo que éstos puedan sentir y 
          disfrutar de momentos inolvidables. Las experiencias se conseguirán gracias a la asociación entre las distintas empresas 
          y la nuestra consiguiendo un beneficio mutuo.
        </p>
      </section>
    </div>
  );
}
