import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";

const heroSlides = [
  { image: "/acampada.jpg", caption: "Disfruta del cielo" },
  { image: "/buceo.jpg", caption: "Explora las profundidades" },
  { image: "/playa.jpg", caption: "Vive el momento" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Carousel */}
      <section style={{ padding: 0 }}>
        <Carousel slides={heroSlides} intervalMs={4500} height={500} />
      </section>

      {/* ÚLTIMAS NOVEDADES */}
      <section className="container" style={{ padding: "56px 0 48px" }}>
        <div className="anim-fade-in-up" style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "baseline",
          marginBottom: 32,
        }}>
          <div>
            <h2 className="grad-text" style={{
              margin: 0,
              fontSize: "clamp(1.6rem, 3vw, 2rem)",
              fontFamily: "var(--font-display)",
            }}>
              Últimas novedades
            </h2>
            <p style={{ color: "var(--color-text-dim)", margin: "6px 0 0", fontSize: "0.9rem" }}>
              Descubre experiencias trending en Málaga
            </p>
          </div>
          <Link to="/offers" style={{
            color: "var(--color-cyan)",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
          }}>
            Ver todas →
          </Link>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 20,
        }}>
          {/* Panel 1 - Camping */}
          <div className="card anim-fade-in-up delay-1" style={{
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: 220,
          }}>
            <div style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 10,
            }}>
              <span className="badge badge-magenta">🔥 Tendencia</span>
              <h3 style={{
                margin: 0,
                color: "var(--color-text-light)",
                fontSize: "1.15rem",
                fontFamily: "var(--font-display)",
                lineHeight: 1.3,
              }}>
                Conexiones con el cielo y la tierra
              </h3>
              <div style={{ color: "var(--color-orange)", fontWeight: 700, fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>
                49.99€
              </div>
              <span className="badge badge-cyan" style={{ alignSelf: "flex-start" }}>✅ Verificado</span>
              <Link to="/offers" className="btn-primary" style={{
                marginTop: 6,
                display: "inline-block",
                textAlign: "center",
                padding: "10px 18px",
                textDecoration: "none",
                fontSize: "0.88rem",
                alignSelf: "flex-start",
              }}>
                Reservar
              </Link>
            </div>
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img src="/acampada.jpg" alt="Acampada" style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }} />
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, rgba(14,11,22,0.3) 0%, transparent 60%)",
              }} />
            </div>
          </div>

          {/* Panel 2 - Buceo */}
          <div className="card anim-fade-in-up delay-2" style={{
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: 220,
          }}>
            <div style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 10,
            }}>
              <span className="badge badge-magenta">🔥 Tendencia</span>
              <h3 style={{
                margin: 0,
                color: "var(--color-text-light)",
                fontSize: "1.15rem",
                fontFamily: "var(--font-display)",
                lineHeight: 1.3,
              }}>
                Buceo en las profundidades del mar
              </h3>
              <div style={{ color: "var(--color-orange)", fontWeight: 700, fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>
                79.00€
              </div>
              <span className="badge badge-cyan" style={{ alignSelf: "flex-start" }}>✅ Verificado</span>
              <Link to="/offers" className="btn-primary" style={{
                marginTop: 6,
                display: "inline-block",
                textAlign: "center",
                padding: "10px 18px",
                textDecoration: "none",
                fontSize: "0.88rem",
                alignSelf: "flex-start",
              }}>
                Reservar
              </Link>
            </div>
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img src="/buceo.jpg" alt="Buceo" style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }} />
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, rgba(14,11,22,0.3) 0%, transparent 60%)",
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* PARA TI */}
      <section className="container" style={{ padding: "8px 0 64px" }}>
        <h2 className="grad-text-reverse anim-fade-in-up" style={{
          margin: "0 0 24px",
          fontSize: "clamp(1.6rem, 3vw, 2rem)",
          fontFamily: "var(--font-display)",
        }}>
          Para ti
        </h2>

        <div className="card anim-fade-in-up delay-1" style={{
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          border: "1px solid rgba(0, 212, 255, 0.15)",
          minHeight: 240,
        }}>
          <div style={{
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 12,
          }}>
            <span className="badge badge-orange">🎯 Recomendado</span>
            <h3 style={{
              margin: 0,
              color: "var(--color-text-light)",
              fontSize: "1.25rem",
              fontFamily: "var(--font-display)",
              lineHeight: 1.3,
            }}>
              Tour nocturno por las playas de Málaga
            </h3>
            <div style={{ color: "var(--color-orange)", fontWeight: 700, fontSize: "1.15rem", fontFamily: "var(--font-display)" }}>
              29.90€
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="badge badge-cyan">✅ Verificado</span>
              <span className="badge badge-emerald">⚡ Reserva rápida</span>
            </div>
            <Link to="/offers" className="btn-primary" style={{
              marginTop: 4,
              display: "inline-block",
              textAlign: "center",
              padding: "10px 18px",
              textDecoration: "none",
              fontSize: "0.88rem",
              alignSelf: "flex-start",
            }}>
              Reservar
            </Link>
          </div>
          <div style={{ position: "relative", overflow: "hidden" }}>
            <img src="/playa.jpg" alt="Playa" style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }} />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(14,11,22,0.3) 0%, transparent 60%)",
            }} />
          </div>
        </div>
      </section>
    </div>
  );
}
