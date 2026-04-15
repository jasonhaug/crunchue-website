import EyeCanvas from "../EyeCanvas";
import Image from "next/image";

const linkStyle: React.CSSProperties = {
  padding: "14px 20px",
  color: "rgba(235, 235, 245, 0.95)",
  border: "1px solid rgba(180, 180, 195, 0.35)",
  background: "rgba(0, 0, 0, 0.55)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  fontSize: "13px",
  letterSpacing: "0.2em",
  textDecoration: "none",
  fontFamily: "var(--font-geist-mono), monospace",
  textTransform: "uppercase",
  flex: "1 1 140px",
  maxWidth: "220px",
  textAlign: "center",
};

export default function Music() {
  return (
    <>
      <EyeCanvas backgroundMode />
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
          pointerEvents: "none",
          zIndex: 10,
          gap: "24px",
          fontFamily: "var(--font-geist-mono), monospace",
          overflow: "auto",
        }}
      >
        <div
          style={{
            width: "min(280px, 70vw)",
            aspectRatio: "1 / 1",
            position: "relative",
            boxShadow: "0 12px 48px rgba(0, 0, 0, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            flexShrink: 0,
          }}
        >
          <Image
            src="/aigirlfriend-cover.png"
            alt="AI Girlfriend album cover"
            fill
            sizes="(max-width: 480px) 70vw, 280px"
            priority
            style={{ objectFit: "cover" }}
          />
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: "rgba(235, 235, 245, 0.95)",
              fontSize: "clamp(18px, 4.5vw, 26px)",
              letterSpacing: "0.35em",
              textShadow: "0 0 24px rgba(0, 0, 0, 0.95)",
              marginBottom: "8px",
            }}
          >
            AI GIRLFRIEND
          </div>
          <div
            style={{
              color: "rgba(170, 170, 180, 0.7)",
              fontSize: "clamp(10px, 2.4vw, 12px)",
              letterSpacing: "0.25em",
              textShadow: "0 0 20px rgba(0, 0, 0, 0.95)",
            }}
          >
            BY CRUNCHUE
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            pointerEvents: "auto",
            width: "100%",
            maxWidth: "460px",
          }}
        >
          <a href="#" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Spotify
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Apple Music
          </a>
        </div>
      </div>
    </>
  );
}
