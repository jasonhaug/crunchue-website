"use client";

import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let animId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particles spiraling inward
    const particles: {
      angle: number;
      radius: number;
      speed: number;
      brightness: number;
      size: number;
      drift: number;
    }[] = [];

    for (let i = 0; i < 600; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 60 + Math.random() * Math.max(canvas.width, canvas.height) * 0.6,
        speed: 0.0005 + Math.random() * 0.002,
        brightness: Math.random(),
        size: 0.5 + Math.random() * 2,
        drift: -0.05 - Math.random() * 0.15,
      });
    }

    // Sporadic light flashes
    const flashes: {
      angle: number;
      radius: number;
      life: number;
      maxLife: number;
      brightness: number;
    }[] = [];

    const spawnFlash = () => {
      flashes.push({
        angle: Math.random() * Math.PI * 2,
        radius: 80 + Math.random() * 300,
        life: 0,
        maxLife: 30 + Math.random() * 60,
        brightness: 0.4 + Math.random() * 0.6,
      });
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Fill black
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      time += 0.003;

      // Draw accretion disk - layered spinning rings
      const maxR = Math.max(w, h) * 0.55;

      for (let ring = 0; ring < 80; ring++) {
        const r = 40 + (ring / 80) * maxR;
        const opacity = Math.max(0, 0.02 + 0.06 * Math.sin(ring * 0.3 + time * 2));
        const wobble = Math.sin(ring * 0.15 + time * 1.5) * 3;

        ctx.beginPath();
        ctx.ellipse(
          cx + wobble,
          cy + wobble * 0.5,
          r,
          r * 0.38, // flatten to disk perspective
          time * 0.15 + ring * 0.008,
          0,
          Math.PI * 2
        );
        const grey = 40 + Math.sin(ring * 0.2 + time) * 30;
        ctx.strokeStyle = `rgba(${grey}, ${grey}, ${grey + 5}, ${opacity})`;
        ctx.lineWidth = 1 + Math.sin(ring * 0.5 + time * 3) * 0.5;
        ctx.stroke();
      }

      // Spiral arms - wispy streaks
      for (let arm = 0; arm < 3; arm++) {
        const armOffset = (arm / 3) * Math.PI * 2;
        ctx.beginPath();
        for (let i = 0; i < 300; i++) {
          const t = i / 300;
          const angle = armOffset + t * Math.PI * 4 + time * 0.2;
          const r = 30 + t * maxR * 0.9;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r * 0.38;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const armBright = 25 + Math.sin(time + arm) * 15;
        ctx.strokeStyle = `rgba(${armBright}, ${armBright}, ${armBright + 8}, 0.08)`;
        ctx.lineWidth = 8 + Math.sin(time * 0.5 + arm) * 4;
        ctx.stroke();

        // Thinner bright core of spiral
        ctx.strokeStyle = `rgba(${armBright + 40}, ${armBright + 40}, ${armBright + 45}, 0.04)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw particles
      for (const p of particles) {
        p.angle += p.speed;
        p.radius += p.drift;

        // Reset particles that reach center
        if (p.radius < 20) {
          p.radius = 60 + Math.random() * maxR;
          p.angle = Math.random() * Math.PI * 2;
          p.brightness = Math.random();
        }

        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius * 0.38;

        // Fade as they approach center
        const distFade = Math.min(1, (p.radius - 20) / 100);
        const flicker = 0.5 + 0.5 * Math.sin(time * 10 + p.angle * 5);
        const alpha = p.brightness * distFade * flicker * 0.6;

        const grey = Math.floor(120 + p.brightness * 135);
        ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * distFade, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sporadic light flashes
      if (Math.random() < 0.03) spawnFlash();

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life++;
        if (f.life > f.maxLife) {
          flashes.splice(i, 1);
          continue;
        }

        const progress = f.life / f.maxLife;
        const fadeIn = Math.min(1, progress * 5);
        const fadeOut = 1 - progress;
        const alpha = fadeIn * fadeOut * f.brightness * 0.3;

        const x = cx + Math.cos(f.angle + time * 0.2) * f.radius;
        const y = cy + Math.sin(f.angle + time * 0.2) * f.radius * 0.38;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, 15 + f.brightness * 20);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.3, `rgba(180, 180, 190, ${alpha * 0.5})`);
        grad.addColorStop(1, `rgba(100, 100, 110, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 15 + f.brightness * 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Black hole center - dark void with gradient
      const eventHorizon = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      eventHorizon.addColorStop(0, "rgba(0, 0, 0, 1)");
      eventHorizon.addColorStop(0.5, "rgba(0, 0, 0, 0.98)");
      eventHorizon.addColorStop(0.7, "rgba(0, 0, 0, 0.8)");
      eventHorizon.addColorStop(0.85, "rgba(5, 5, 8, 0.4)");
      eventHorizon.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = eventHorizon;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 80, 32, time * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Faint ring of light at event horizon edge (photon ring)
      ctx.beginPath();
      ctx.ellipse(cx, cy, 55, 22, time * 0.15, 0, Math.PI * 2);
      const photonAlpha = 0.06 + Math.sin(time * 2) * 0.03;
      ctx.strokeStyle = `rgba(200, 200, 210, ${photonAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Outer vignette
      const vignette = ctx.createRadialGradient(cx, cy, maxR * 0.4, cx, cy, maxR * 1.2);
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.7)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        background: "#000",
      }}
    />
  );
}
