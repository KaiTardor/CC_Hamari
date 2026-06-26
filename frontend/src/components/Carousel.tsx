import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  image: string;
  alt?: string;
  caption?: string;
};

type CarouselProps = {
  slides: Slide[];
  intervalMs?: number;
  height?: number | string;
};

export default function Carousel({ slides, intervalMs = 4500, height = 480 }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const safeSlides = useMemo(() => (slides.length > 0 ? slides : [
    { image: "", alt: "Slide 1", caption: "" },
    { image: "", alt: "Slide 2", caption: "" },
    { image: "", alt: "Slide 3", caption: "" },
  ]), [slides]);

  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeSlides.length);
    }, intervalMs) as unknown as number;
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [safeSlides.length, intervalMs]);

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      height,
      borderRadius: 0,
    }}>
      <div
        style={{
          display: "flex",
          width: `${safeSlides.length * 100}%`,
          height: "100%",
          transform: `translateX(-${index * (100 / safeSlides.length)}%)`,
          transition: "transform 700ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {safeSlides.map((s, i) => (
          <div key={i} style={{ flex: `0 0 ${100 / safeSlides.length}%`, position: "relative" }}>
            <img
              src={s.image}
              alt={s.alt ?? `Slide ${i + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                filter: "saturate(1.1) brightness(0.9)",
              }}
            />
            {/* Atmospheric overlays */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(14,11,22,0.2) 0%, rgba(14,11,22,0.1) 40%, rgba(14,11,22,0.7) 100%)",
            }} />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(14,11,22,0.4) 0%, transparent 50%)",
            }} />

            {s.caption && (
              <div style={{
                position: "absolute",
                left: 40,
                bottom: 48,
                maxWidth: 500,
              }}>
                <div style={{
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                  marginBottom: 8,
                }}>
                  {s.caption}
                </div>
                <div style={{
                  width: 48,
                  height: 3,
                  borderRadius: 2,
                  background: "var(--grad-brand)",
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      <div style={{
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 10,
      }}>
        {safeSlides.map((_, i) => (
          <button
            key={i}
            aria-label={`Ir al slide ${i + 1}`}
            onClick={() => setIndex(i)}
            style={{
              width: i === index ? 28 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              background: i === index ? "var(--color-magenta)" : "rgba(255,255,255,0.35)",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
