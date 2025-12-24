import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";

const heroSlides = [
  { image: "/acampada.jpg", caption: "Disfruta del cielo" },
  { image: "/buceo.jpg", caption: "Explora las profundidades" },
  { image: "/playa.jpg", caption: "Vive el momento" },
];

export default function HomePage() {
  // Paneles HARDCODEADOS (sin depender de DB) usando estética + imágenes del carrusel
  const panelStyle: React.CSSProperties = {
    background: "var(--color-bg-card)",
    borderRadius: 16,
    border: "2px solid rgba(255, 45, 117, 0.22)",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 0,
    minHeight: 190,
    transition: "all 0.3s ease",
  };

  const panelLeftStyle: React.CSSProperties = {
    padding: 18,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 10,
  };

  const panelRightStyle: React.CSSProperties = {
    position: "relative",
    minHeight: 190,
  };

  const panelRightImgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    filter: "saturate(1.05)",
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "var(--color-cyan)",
    background: "rgba(0, 212, 255, 0.10)",
    border: "1px solid rgba(0, 212, 255, 0.25)",
  };

  const ctaStyle: React.CSSProperties = {
    marginTop: 10,
    width: "fit-content",
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 10,
    background: "linear-gradient(135deg, var(--color-magenta), var(--color-orange))",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  };

  const panelHoverIn = (el: HTMLDivElement, shadow: string) => {
    el.style.transform = "translateY(-3px)";
    el.style.boxShadow = shadow;
  };

  const panelHoverOut = (el: HTMLDivElement) => {
    el.style.transform = "translateY(0)";
    el.style.boxShadow = "none";
  };

  return (
    <div>
      <section style={{ padding: 0 }}>
        <Carousel slides={heroSlides} intervalMs={4500} height={460} />
      </section>

      {/* ÚLTIMAS NOVEDADES */}
      <section className="container" style={{ padding: "36px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
          <div>
            <h2
              style={{
                margin: "12px 0 8px",
                background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Últimas novedades
            </h2>
          </div>

          <Link to="/offers" style={{ color: "var(--color-cyan)", textDecoration: "none", fontWeight: 600 }}>
            Ver todas →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
            marginTop: 18,
          }}
        >
          {/* Panel 1 */}
          <div
            style={panelStyle}
            onMouseEnter={(e) => panelHoverIn(e.currentTarget, "0 10px 26px rgba(255, 45, 117, 0.20)")}
            onMouseLeave={(e) => panelHoverOut(e.currentTarget)}
          >
            <div style={panelLeftStyle}>
              <span style={badgeStyle}>🔥🔥🔥Tendencia</span>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 5, alignItems: "baseline" }}>
                <h3 style={{ margin: 0, color: "var(--color-cyan)", fontSize: "1.10rem" }}>
                  Conexiones con el cielo y la tierra
                </h3>
                <div style={{ color: "var(--color-orange)", fontWeight: 800, fontSize: "1.05rem" }}>49.99€</div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>✅ Verificado</span>
              </div>

              <Link to="/offers" style={ctaStyle}>
                Reservar
              </Link>
            </div>

            <div style={panelRightStyle}>
              <img src="/acampada.jpg" alt="Acampada" style={panelRightImgStyle} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, rgba(10,10,10,0.0), rgba(10,10,10,0.25))",
                }}
              />
            </div>
          </div>

          {/* Panel 2 */}
          <div
            style={panelStyle}
            onMouseEnter={(e) => panelHoverIn(e.currentTarget, "0 10px 26px rgba(255, 45, 117, 0.20)")}
            onMouseLeave={(e) => panelHoverOut(e.currentTarget)}
          >
            <div style={panelLeftStyle}>
              <span style={badgeStyle}>🔥🔥🔥Tendencia</span>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 5, alignItems: "baseline" }}>
                <h3 style={{ margin: 0, color: "var(--color-cyan)", fontSize: "1.10rem" }}>
                  Buceo en las profundidades del mar
                </h3>
                <div style={{ color: "var(--color-orange)", fontWeight: 800, fontSize: "1.05rem" }}>79.00€</div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>✅ Verificado</span>
              </div>

              <Link to="/offers" style={ctaStyle}>
                Reservar
              </Link>
            </div>

            <div style={panelRightStyle}>
              <img src="/buceo.jpg" alt="Buceo" style={panelRightImgStyle} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, rgba(10,10,10,0.0), rgba(10,10,10,0.25))",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* PARA TI */}
      <section className="container" style={{ padding: "8px 0 42px" }}>
        <h2
          style={{
            margin: "12px 0 8px",
            background: "linear-gradient(135deg, #00d4ff, #ff9933, #ff2d75)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Para ti
        </h2>

        <div
          style={{
            ...panelStyle,
            border: "2px solid rgba(0, 212, 255, 0.22)",
            marginTop: 14,
          }}
          onMouseEnter={(e) => panelHoverIn(e.currentTarget, "0 10px 26px rgba(0, 212, 255, 0.18)")}
          onMouseLeave={(e) => panelHoverOut(e.currentTarget)}
        >
          <div style={panelLeftStyle}>
            <span
              style={{
                ...badgeStyle,
                color: "var(--color-magenta)",
                background: "rgba(255, 45, 117, 0.10)",
                border: "1px solid rgba(255, 45, 117, 0.25)",
              }}
            >
              🎯 Recomendado
            </span>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
              <h3 style={{ margin: 0, color: "var(--color-cyan)", fontSize: "1.15rem" }}>
                Tour nocturno por las playas de Málaga
              </h3>
              <div style={{ color: "var(--color-orange)", fontWeight: 800, fontSize: "1.05rem" }}>29.90€</div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
              <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>✅ Verificado</span>
              <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>⚡ Reserva rápida</span>
            </div>

            <Link to="/offers" style={ctaStyle}>
              Reservar
            </Link>
          </div>

          <div style={panelRightStyle}>
            <img src="/playa.jpg" alt="Playa" style={panelRightImgStyle} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, rgba(10,10,10,0.0), rgba(10,10,10,0.25))",
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
