"use client";

import { useState, useEffect } from "react";

type WindowId = "spotify" | "aigirlfriend";

interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  zIndex: number;
}

export default function Home() {
  const [clock, setClock] = useState("");
  const [windows, setWindows] = useState<WindowState[]>([
    { id: "spotify", title: "CRUNCHUE - Spotify", isOpen: true, zIndex: 10 },
    { id: "aigirlfriend", title: "AI GIRLFRIEND", isOpen: false, zIndex: 9 },
  ]);
  const [topZ, setTopZ] = useState(11);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const bringToFront = (id: WindowId) => {
    const newZ = topZ + 1;
    setTopZ(newZ);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: newZ } : w))
    );
  };

  const toggleWindow = (id: WindowId) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const newZ = topZ + 1;
        setTopZ(newZ);
        return { ...w, isOpen: !w.isOpen, zIndex: newZ };
      })
    );
  };

  const closeWindow = (id: WindowId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w))
    );
  };

  const getWindow = (id: WindowId) => windows.find((w) => w.id === id)!;

  return (
    <>
      {/* CRT Scanlines */}
      <div className="crt-overlay" />

      {/* Chrome Frame */}
      <div className="chrome-frame" />
      <div className="chrome-corner chrome-corner--tl" />
      <div className="chrome-corner chrome-corner--tr" />
      <div className="chrome-corner chrome-corner--bl" />
      <div className="chrome-corner chrome-corner--br" />
      <div className="chrome-blade chrome-blade--left" />
      <div className="chrome-blade chrome-blade--right" />
      <div className="chrome-blade chrome-blade--top" />
      <div className="chrome-blade chrome-blade--bottom" />

      {/* Desktop */}
      <div className="desktop">
        <div className="desktop-grid" />

        {/* Ambient glow effects */}
        <div
          className="ambient-glow"
          style={{
            width: 300,
            height: 300,
            top: "20%",
            left: "30%",
            background: "rgba(80, 40, 160, 0.15)",
          }}
        />
        <div
          className="ambient-glow"
          style={{
            width: 200,
            height: 200,
            bottom: "30%",
            right: "20%",
            background: "rgba(29, 185, 84, 0.08)",
            animationDelay: "3s",
          }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${15 + i * 10}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${6 + (i % 4) * 2}s`,
            }}
          />
        ))}

        {/* Desktop Icons */}
        <div
          className="absolute top-6 left-6 flex flex-col gap-4"
          style={{ zIndex: 5 }}
        >
          <div className="desktop-icon" onDoubleClick={() => toggleWindow("spotify")}>
            <div className="desktop-icon-img">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" fill="#1DB954" />
                <path
                  d="M34.4 21.6c-5.6-3.3-14.8-3.6-20.1-2 -.9.3-.9-.5-.7-1 .3-.9 1-.9 1-.9 5.8-1.8 15.4-1.4 21.5 2.2.8.5.3 1.3-.2 1.5-.5.2-1.1 0-1.5-.2zm-.4 4.8c-.4.7-1.2.9-1.9.5-4.7-2.9-11.8-3.7-17.3-2-.7.2-1.4-.2-1.6-.9-.2-.7.2-1.4.9-1.6 6.3-1.9 14.1-1 19.4 2.3.7.4.9 1.2.5 1.7zm-2.2 4.6c-.3.5-1 .7-1.5.4-4.1-2.5-9.2-3.1-15.3-1.7-.6.1-1.1-.2-1.3-.8-.1-.6.2-1.1.8-1.3 6.6-1.5 12.3-.9 16.9 1.9.5.3.7 1 .4 1.5z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="desktop-icon-label">Spotify</span>
          </div>

          <div
            className="desktop-icon"
            onDoubleClick={() => toggleWindow("aigirlfriend")}
          >
            <div className="desktop-icon-img">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect
                  x="4"
                  y="4"
                  width="40"
                  height="40"
                  rx="8"
                  fill="url(#gf-grad)"
                />
                <defs>
                  <linearGradient
                    id="gf-grad"
                    x1="4"
                    y1="4"
                    x2="44"
                    y2="44"
                  >
                    <stop stopColor="#ff2d55" />
                    <stop offset="1" stopColor="#a020f0" />
                  </linearGradient>
                </defs>
                <text
                  x="24"
                  y="30"
                  textAnchor="middle"
                  fill="white"
                  fontSize="18"
                  fontFamily="serif"
                >
                  AI
                </text>
              </svg>
            </div>
            <span className="desktop-icon-label">AI Girlfriend</span>
          </div>

          <a
            href="https://open.spotify.com/artist/3S38eL9AGKJohkdw6uYUNn"
            target="_blank"
            rel="noopener noreferrer"
            className="desktop-icon"
          >
            <div className="desktop-icon-img">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="6" y="6" width="36" height="36" rx="4" fill="#282838" stroke="#606080" strokeWidth="2" />
                <path d="M18 14v14l12-7z" fill="#c0c0c0" />
              </svg>
            </div>
            <span className="desktop-icon-label">Artist Page</span>
          </a>
        </div>

        {/* ===== SPOTIFY WINDOW ===== */}
        {getWindow("spotify").isOpen && (
          <div
            className="window"
            style={{
              top: "8%",
              left: "22%",
              width: "min(520px, 60vw)",
              height: "min(580px, 72vh)",
              zIndex: getWindow("spotify").zIndex,
            }}
            onMouseDown={() => bringToFront("spotify")}
          >
            <div className="window-titlebar window-titlebar-active">
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: "#1DB954",
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <span className="window-title">
                CRUNCHUE - Spotify Player
              </span>
              <button
                className="window-btn"
                onClick={() => closeWindow("spotify")}
              >
                x
              </button>
            </div>
            <div className="window-body spotify-glow">
              <iframe
                src="https://open.spotify.com/embed/artist/3S38eL9AGKJohkdw6uYUNn?utm_source=generator&theme=0"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ border: 0 }}
              />
            </div>
          </div>
        )}

        {/* ===== AI GIRLFRIEND WINDOW ===== */}
        {getWindow("aigirlfriend").isOpen && (
          <div
            className="window"
            style={{
              top: "12%",
              left: "35%",
              width: "min(420px, 55vw)",
              height: "min(340px, 50vh)",
              zIndex: getWindow("aigirlfriend").zIndex,
            }}
            onMouseDown={() => bringToFront("aigirlfriend")}
          >
            <div className="window-titlebar window-titlebar-active">
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: "linear-gradient(135deg, #ff2d55, #a020f0)",
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <span className="window-title">AI GIRLFRIEND</span>
              <button
                className="window-btn"
                onClick={() => closeWindow("aigirlfriend")}
              >
                x
              </button>
            </div>
            <div className="window-body flex flex-col items-center justify-center p-8 text-center gap-6">
              <div
                style={{
                  fontSize: 64,
                  filter: "drop-shadow(0 0 20px rgba(255, 45, 85, 0.4))",
                }}
              >
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <path
                    d="M40 70s-28-16-28-36c0-10 8-18 18-18 6 0 10 4 10 4s4-4 10-4c10 0 18 8 18 18 0 20-28 36-28 36z"
                    fill="url(#heart-grad)"
                  />
                  <defs>
                    <linearGradient
                      id="heart-grad"
                      x1="12"
                      y1="16"
                      x2="68"
                      y2="70"
                    >
                      <stop stopColor="#ff2d55" />
                      <stop offset="1" stopColor="#a020f0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#e0e0e0",
                    marginBottom: 8,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  AI Girlfriend
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "#808080",
                    marginBottom: 20,
                    lineHeight: 1.6,
                  }}
                >
                  Your toxic AI companion. Talk to her if you dare.
                </p>
              </div>
              <a
                href="/aigirlfriend"
                style={{
                  display: "inline-block",
                  padding: "10px 32px",
                  background: "linear-gradient(135deg, #ff2d55, #a020f0)",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 14,
                  letterSpacing: 1,
                  textDecoration: "none",
                  border: "2px solid",
                  borderColor: "#c0c0c0 #404040 #404040 #c0c0c0",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                LAUNCH
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className="taskbar">
        <button className="start-btn">
          <span style={{ fontSize: 16 }}>&#9670;</span>
          CRUNCHUE
        </button>
        <div className="taskbar-divider" />
        <button
          className={`taskbar-item ${getWindow("spotify").isOpen ? "taskbar-item--active" : ""}`}
          onClick={() => toggleWindow("spotify")}
        >
          <span style={{ color: "#1DB954" }}>&#9835;</span>
          Spotify
        </button>
        <button
          className={`taskbar-item ${getWindow("aigirlfriend").isOpen ? "taskbar-item--active" : ""}`}
          onClick={() => toggleWindow("aigirlfriend")}
        >
          <span style={{ color: "#ff2d55" }}>&#9829;</span>
          AI GF
        </button>
        <div className="taskbar-clock">{clock}</div>
      </div>
    </>
  );
}
