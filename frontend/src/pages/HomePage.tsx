import Carousel from "../components/Carousel";

export default function HomePage() {
  return (
    <div>
      <section style={{ padding: 0 }}>
        <Carousel
          slides={[
            { image: "/acampada.jpg", caption: "Disfruta del cielo" },
            { image: "/buceo.jpg", caption: "Explora las profundidades" },
            { image: "/playa.jpg", caption: "Vive el momento" },
          ]}
          intervalMs={4500}
          height={460}
        />
      </section> 

      <section className="container" style={{ padding: "32px 0" }}>
        <h2 style={{ margin: "12px 0 8px", background: "linear-gradient(135deg, #ff2d75, #ff9933, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Últimas novedades</h2>
        <p style={{ margin: 0, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          texto texto texto texto texto texto texto texto texto texto texto texto
        </p>
      </section>
    </div>
  );
}
