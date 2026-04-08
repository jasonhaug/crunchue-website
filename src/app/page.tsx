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

    // Offscreen noise ring texture
    let noiseCanvas: HTMLCanvasElement;
    let noiseCtx: CanvasRenderingContext2D;
    let noiseSize = 0;

    const buildNoiseTexture = (size: number) => {
      noiseSize = size;
      noiseCanvas = document.createElement("canvas");
      noiseCanvas.width = size;
      noiseCanvas.height = size;
      noiseCtx = noiseCanvas.getContext("2d")!;

      const imageData = noiseCtx.createImageData(size, size);
      const data = imageData.data;
      const cx = size / 2;
      const cy = size / 2;
      const innerR = size * 0.08;
      const outerR = size * 0.48;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const idx = (y * size + x) * 4;

          if (dist > innerR && dist < outerR) {
            // How deep into the ring (0 at edges, 1 at middle)
            const ringMid = (innerR + outerR) / 2;
            const ringHalf = (outerR - innerR) / 2;
            const ringPos = 1 - Math.abs(dist - ringMid) / ringHalf;
            const falloff = ringPos * ringPos;

            const noise = Math.random();
            const val = Math.floor(noise * 180 + 40);

            data[idx] = val;
            data[idx + 1] = val;
            data[idx + 2] = val + Math.floor(noise * 8);
            data[idx + 3] = Math.floor(falloff * noise * 45);
          } else {
            data[idx + 3] = 0;
          }
        }
      }
      noiseCtx.putImageData(imageData, 0, 0);
    };

    // Second noise layer for more texture
    let noiseCanvas2: HTMLCanvasElement;

    const buildNoiseTexture2 = (size: number) => {
      noiseCanvas2 = document.createElement("canvas");
      noiseCanvas2.width = size;
      noiseCanvas2.height = size;
      const ctx2 = noiseCanvas2.getContext("2d")!;

      const imageData = ctx2.createImageData(size, size);
      const data = imageData.data;
      const cx = size / 2;
      const cy = size / 2;
      const innerR = size * 0.06;
      const outerR = size * 0.45;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const idx = (y * size + x) * 4;

          if (dist > innerR && dist < outerR) {
            const ringMid = (innerR + outerR) / 2;
            const ringHalf = (outerR - innerR) / 2;
            const ringPos = 1 - Math.abs(dist - ringMid) / ringHalf;
            const falloff = ringPos * ringPos * ringPos;

            // Clumpy noise - use threshold for more texture
            const noise = Math.random();
            const clump = noise > 0.6 ? noise : noise * 0.2;
            const val = Math.floor(clump * 140 + 60);

            data[idx] = val;
            data[idx + 1] = val;
            data[idx + 2] = val;
            data[idx + 3] = Math.floor(falloff * clump * 35);
          } else {
            data[idx + 3] = 0;
          }
        }
      }
      ctx2.putImageData(imageData, 0, 0);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const texSize = Math.max(canvas.width, canvas.height);
      buildNoiseTexture(texSize);
      buildNoiseTexture2(texSize);
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

    for (let i = 0; i < 500; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 40 + Math.random() * Math.max(canvas.width, canvas.height) * 0.5,
        speed: 0.0004 + Math.random() * 0.0018,
        brightness: Math.random(),
        size: 0.5 + Math.random() * 1.8,
        drift: -0.04 - Math.random() * 0.12,
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
        radius: 60 + Math.random() * 280,
        life: 0,
        maxLife: 30 + Math.random() * 60,
        brightness: 0.3 + Math.random() * 0.5,
      });
    };

    // Thin streaky lines spiraling in
    const streaks: {
      angle: number;
      radius: number;
      length: number;
      speed: number;
      brightness: number;
    }[] = [];

    for (let i = 0; i < 120; i++) {
      streaks.push({
        angle: Math.random() * Math.PI * 2,
        radius: 50 + Math.random() * 400,
        length: 10 + Math.random() * 40,
        speed: 0.001 + Math.random() * 0.003,
        brightness: 0.1 + Math.random() * 0.4,
      });
    }

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Fill black
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      time += 0.003;

      // Draw noise ring - rotated slowly
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.15);
      ctx.drawImage(noiseCanvas, -noiseSize / 2, -noiseSize / 2);
      ctx.restore();

      // Second noise layer rotating opposite direction
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-time * 0.08);
      ctx.drawImage(noiseCanvas2, -noiseSize / 2, -noiseSize / 2);
      ctx.restore();

      // Thin streaky lines
      for (const s of streaks) {
        s.angle += s.speed;
        s.radius -= 0.03;

        if (s.radius < 25) {
          s.radius = 50 + Math.random() * 400;
          s.angle = Math.random() * Math.PI * 2;
        }

        const x1 = cx + Math.cos(s.angle) * s.radius;
        const y1 = cy + Math.sin(s.angle) * s.radius;
        const x2 = cx + Math.cos(s.angle - 0.05) * (s.radius + s.length);
        const y2 = cy + Math.sin(s.angle - 0.05) * (s.radius + s.length);

        const distFade = Math.min(1, (s.radius - 25) / 80);
        const alpha = s.brightness * distFade * (0.5 + 0.5 * Math.sin(time * 3 + s.angle * 4));

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(160, 160, 165, ${alpha})`;
        ctx.lineWidth = 0.5 + Math.random() * 0.5;
        ctx.stroke();
      }

      // Draw particles
      for (const p of particles) {
        p.angle += p.speed;
        p.radius += p.drift;

        if (p.radius < 18) {
          p.radius = 50 + Math.random() * Math.max(w, h) * 0.5;
          p.angle = Math.random() * Math.PI * 2;
          p.brightness = Math.random();
        }

        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius;

        const distFade = Math.min(1, (p.radius - 18) / 80);
        const flicker = 0.5 + 0.5 * Math.sin(time * 10 + p.angle * 5);
        const alpha = p.brightness * distFade * flicker * 0.55;

        const grey = Math.floor(130 + p.brightness * 125);
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
        const alpha = fadeIn * fadeOut * f.brightness * 0.25;

        const x = cx + Math.cos(f.angle + time * 0.15) * f.radius;
        const y = cy + Math.sin(f.angle + time * 0.15) * f.radius;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, 12 + f.brightness * 18);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.3, `rgba(180, 180, 190, ${alpha * 0.5})`);
        grad.addColorStop(1, `rgba(100, 100, 110, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 12 + f.brightness * 18, 0, Math.PI * 2);
        ctx.fill();
      }

      // Black hole center - dark void
      const eventHorizon = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      eventHorizon.addColorStop(0, "rgba(0, 0, 0, 1)");
      eventHorizon.addColorStop(0.5, "rgba(0, 0, 0, 0.97)");
      eventHorizon.addColorStop(0.75, "rgba(0, 0, 0, 0.7)");
      eventHorizon.addColorStop(0.9, "rgba(3, 3, 5, 0.3)");
      eventHorizon.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = eventHorizon;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fill();

      // Faint photon ring at event horizon edge
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 2);
      const photonAlpha = 0.05 + Math.sin(time * 2) * 0.025;
      ctx.strokeStyle = `rgba(200, 200, 210, ${photonAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Outer vignette
      const maxR = Math.max(w, h) * 0.55;
      const vignette = ctx.createRadialGradient(cx, cy, maxR * 0.35, cx, cy, maxR * 1.1);
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.75)");
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
