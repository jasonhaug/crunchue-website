import EyeCanvas from "../EyeCanvas";

const linkStyle: React.CSSProperties = {
  padding: "12px 22px",
  color: "rgba(230, 230, 240, 0.9)",
  border: "1px solid rgba(180, 180, 195, 0.35)",
  background: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  fontSize: "13px",
  letterSpacing: "0.2em",
  textDecoration: "none",
  fontFamily: "var(--font-geist-mono), monospace",
  textTransform: "uppercase",
};

export default function Music() {
  return (
    <>
      <EyeCanvas />
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 20px 60px",
          pointerEvents: "none",
          zIndex: 10,
          fontFamily: "var(--font-geist-mono), monospace",
        }}
      >
        <div
          style={{
            color: "rgba(225, 225, 235, 0.88)",
            fontSize: "clamp(16px, 2.6vw, 22px)",
            letterSpacing: "0.35em",
            textAlign: "center",
            marginBottom: "6px",
            textShadow: "0 0 24px rgba(0, 0, 0, 0.9)",
          }}
        >
          AI GIRLFRIEND
        </div>
        <div
          style={{
            color: "rgba(170, 170, 180, 0.6)",
            fontSize: "clamp(10px, 1.4vw, 12px)",
            letterSpacing: "0.25em",
            textAlign: "center",
            marginBottom: "28px",
            textShadow: "0 0 20px rgba(0, 0, 0, 0.9)",
          }}
        >
          BY CRUNCHUE
        </div>
        <div
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            justifyContent: "center",
            pointerEvents: "auto",
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
