import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  image: string; // URL
  alt?: string;
  caption?: string;
};

type CarouselProps = {
  slides: Slide[];
  intervalMs?: number;
  height?: number | string;
};

export default function Carousel({ slides, intervalMs = 4000, height = 420 }: CarouselProps) {
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

  // For smooth slide-left animation, translateX by -index * 100%
  return (
    <div style={{ position: "relative", overflow: "hidden", height, borderRadius: 12 }}>
      <div
        style={{
          display: "flex",
          width: `${safeSlides.length * 100}%`,
          height: "100%",
          transform: `translateX(-${index * (100 / safeSlides.length)}%)`,
          transition: "transform 600ms ease",
        }}
      >
        {safeSlides.map((s, i) => (
          <div key={i} style={{ flex: `0 0 ${100 / safeSlides.length}%`, position: "relative" }}>
            <img src={s.image} alt={s.alt ?? `Slide ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {s.caption && (
              <div style={{
                position: "absolute", left: 20, bottom: 20,
                color: "#fff", background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: 8,
                backdropFilter: "blur(2px)",
              }}>
                {s.caption}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Dots */}
      <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 8 }}>
        {safeSlides.map((_, i) => (
          <button key={i} aria-label={`Ir al slide ${i + 1}`} onClick={() => setIndex(i)}
            style={{
              width: 10, height: 10, borderRadius: "50%", border: "none", cursor: "pointer",
              background: i === index ? "#fff" : "rgba(255,255,255,0.6)",
              outline: "2px solid rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
