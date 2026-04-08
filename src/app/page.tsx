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

    let noiseCanvas: HTMLCanvasElement;
    let noiseCanvas2: HTMLCanvasElement;
    let noiseSize = 0;

    const buildNoiseTexture = (size: number, opts: {
      innerR: number; outerR: number; maxAlpha: number; clumpy: boolean;
    }) => {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const nctx = c.getContext("2d")!;
      const imageData = nctx.createImageData(size, size);
      const data = imageData.data;
      const ctr = size / 2;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = x - ctr;
          const dy = y - ctr;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const idx = (y * size + x) * 4;

          if (dist > opts.innerR && dist < opts.outerR) {
            const ringMid = (opts.innerR + opts.outerR) / 2;
            const ringHalf = (opts.outerR - opts.innerR) / 2;
            const ringPos = 1 - Math.abs(dist - ringMid) / ringHalf;
            const falloff = ringPos * ringPos;

            let noise = Math.random();
            if (opts.clumpy) noise = noise > 0.55 ? noise : noise * 0.15;
            const val = Math.floor(noise * 160 + 50);

            data[idx] = val;
            data[idx + 1] = val;
            data[idx + 2] = val + Math.floor(noise * 10);
            data[idx + 3] = Math.floor(falloff * noise * opts.maxAlpha);
          }
        }
      }
      nctx.putImageData(imageData, 0, 0);
      return c;
    };

    // Fiber generation — each fiber has per-zone variation
    const fiberCount = 500;
    const fibers: {
      angle: number;
      // Per-zone characteristics (inner, mid, outer)
      innerWaveFreq: number;
      innerWaveAmp: number;
      innerWidth: number;
      innerBright: number;
      midWaveFreq: number;
      midWaveAmp: number;
      midWidth: number;
      midBright: number;
      outerWaveFreq: number;
      outerWaveAmp: number;
      outerWidth: number;
      outerBright: number;
      // Individual quirks
      lengthMul: number; // how far it reaches (0.85-1.0)
      phase: number;
      kink: number; // sudden bend amount
      kinkPos: number; // where the kink happens (0-1)
    }[] = [];

    for (let i = 0; i < fiberCount; i++) {
      const baseAngle = (i / fiberCount) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.015;
      fibers.push({
        angle: baseAngle + jitter,
        // Inner zone: tight, crinkly, thicker
        innerWaveFreq: 8 + Math.random() * 12,
        innerWaveAmp: 1.5 + Math.random() * 3,
        innerWidth: 0.8 + Math.random() * 1.5,
        innerBright: 0.3 + Math.random() * 0.4,
        // Mid zone: smoother, more defined, moderate wave
        midWaveFreq: 3 + Math.random() * 5,
        midWaveAmp: 2 + Math.random() * 5,
        midWidth: 0.5 + Math.random() * 1.0,
        midBright: 0.2 + Math.random() * 0.35,
        // Outer zone: fine, feathery, subtle wave
        outerWaveFreq: 1.5 + Math.random() * 3,
        outerWaveAmp: 0.5 + Math.random() * 2,
        outerWidth: 0.2 + Math.random() * 0.6,
        outerBright: 0.08 + Math.random() * 0.2,
        lengthMul: 0.88 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
        kink: (Math.random() - 0.5) * 6,
        kinkPos: 0.3 + Math.random() * 0.4,
      });
    }

    // Secondary ultra-fine fibers for fill
    const fineFiberCount = 700;
    const fineFibers: typeof fibers = [];
    for (let i = 0; i < fineFiberCount; i++) {
      fineFibers.push({
        angle: Math.random() * Math.PI * 2,
        innerWaveFreq: 10 + Math.random() * 15,
        innerWaveAmp: 1 + Math.random() * 2,
        innerWidth: 0.3 + Math.random() * 0.5,
        innerBright: 0.1 + Math.random() * 0.2,
        midWaveFreq: 4 + Math.random() * 8,
        midWaveAmp: 1 + Math.random() * 3,
        midWidth: 0.2 + Math.random() * 0.4,
        midBright: 0.08 + Math.random() * 0.15,
        outerWaveFreq: 2 + Math.random() * 4,
        outerWaveAmp: 0.3 + Math.random() * 1.5,
        outerWidth: 0.15 + Math.random() * 0.3,
        outerBright: 0.03 + Math.random() * 0.1,
        lengthMul: 0.6 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        kink: (Math.random() - 0.5) * 4,
        kinkPos: 0.2 + Math.random() * 0.6,
      });
    }

    // Stars
    const stars: { x: number; y: number; size: number; brightness: number; twinkleSpeed: number; phase: number }[] = [];
    const initStars = (w: number, h: number) => {
      stars.length = 0;
      for (let i = 0; i < 1200; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: 0.3 + Math.random() * 1.5,
          brightness: 0.2 + Math.random() * 0.8,
          twinkleSpeed: 0.5 + Math.random() * 3,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    // Drifting particles
    const driftParticles: {
      angle: number; radius: number; speed: number;
      brightness: number; size: number; drift: number;
    }[] = [];
    const initDrift = () => {
      driftParticles.length = 0;
      for (let i = 0; i < 250; i++) {
        driftParticles.push({
          angle: Math.random() * Math.PI * 2,
          radius: 30 + Math.random() * 350,
          speed: 0.0002 + Math.random() * 0.0008,
          brightness: Math.random(),
          size: 0.3 + Math.random() * 1.0,
          drift: -0.015 - Math.random() * 0.04,
        });
      }
    };

    // Flashes
    const flashes: { angle: number; radius: number; life: number; maxLife: number; brightness: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const texSize = Math.max(canvas.width, canvas.height);
      noiseSize = texSize;
      noiseCanvas = buildNoiseTexture(texSize, { innerR: texSize * 0.14, outerR: texSize * 0.38, maxAlpha: 50, clumpy: false });
      noiseCanvas2 = buildNoiseTexture(texSize, { innerR: texSize * 0.12, outerR: texSize * 0.35, maxAlpha: 38, clumpy: true });
      initStars(canvas.width, canvas.height);
      initDrift();
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const minDim = Math.min(w, h);

      const pupilR = minDim * 0.06;
      const irisInnerR = pupilR + minDim * 0.012;
      const irisOuterR = minDim * 0.3;

      // Zone boundaries (as fraction of iris span)
      const innerEnd = 0.3;
      const midEnd = 0.65;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      time += 0.002;

      // Stars
      for (const s of stars) {
        const twinkle = 0.3 + 0.7 * Math.pow(Math.sin(time * s.twinkleSpeed + s.phase), 2);
        const alpha = s.brightness * twinkle;
        const grey = Math.floor(180 + s.brightness * 75);
        ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Noise ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.08);
      ctx.drawImage(noiseCanvas, -noiseSize / 2, -noiseSize / 2);
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-time * 0.05);
      ctx.drawImage(noiseCanvas2, -noiseSize / 2, -noiseSize / 2);
      ctx.restore();

      // Draw fibers with three texture zones
      const drawFibers = (fiberList: typeof fibers) => {
        const irisSpan = irisOuterR - irisInnerR;

        for (const f of fiberList) {
          const totalLen = irisSpan * f.lengthMul;
          const segments = 50;

          // We draw the fiber in three separate strokes for different zone styles
          // but we compute the full path first
          const points: { x: number; y: number; t: number }[] = [];

          for (let s = 0; s <= segments; s++) {
            const t = s / segments;
            const r = irisInnerR + t * totalLen;

            // Zone-blended wave
            let waveFreq: number, waveAmp: number;
            if (t < innerEnd) {
              waveFreq = f.innerWaveFreq;
              waveAmp = f.innerWaveAmp;
            } else if (t < midEnd) {
              const blend = (t - innerEnd) / (midEnd - innerEnd);
              waveFreq = f.innerWaveFreq + (f.midWaveFreq - f.innerWaveFreq) * blend;
              waveAmp = f.innerWaveAmp + (f.midWaveAmp - f.innerWaveAmp) * blend;
            } else {
              const blend = (t - midEnd) / (1 - midEnd);
              waveFreq = f.midWaveFreq + (f.outerWaveFreq - f.midWaveFreq) * blend;
              waveAmp = f.midWaveAmp + (f.outerWaveAmp - f.midWaveAmp) * blend;
            }

            // Add kink
            let kinkOffset = 0;
            if (Math.abs(t - f.kinkPos) < 0.08) {
              const kinkBlend = 1 - Math.abs(t - f.kinkPos) / 0.08;
              kinkOffset = f.kink * kinkBlend * kinkBlend;
            }

            const wave = Math.sin(t * waveFreq * Math.PI + f.phase + time * 0.4) * waveAmp * t;
            const angle = f.angle + (wave + kinkOffset) / r;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            points.push({ x, y, t });
          }

          // Draw inner zone
          ctx.beginPath();
          let started = false;
          for (const p of points) {
            if (p.t > innerEnd + 0.05) break;
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          }
          const innerAlpha = f.innerBright * (0.8 + 0.2 * Math.sin(time * 0.8 + f.phase));
          const innerGrey = Math.floor(160 + f.innerBright * 80);
          ctx.strokeStyle = `rgba(${innerGrey}, ${innerGrey}, ${innerGrey + 5}, ${innerAlpha})`;
          ctx.lineWidth = f.innerWidth;
          ctx.stroke();

          // Draw mid zone
          ctx.beginPath();
          started = false;
          for (const p of points) {
            if (p.t < innerEnd - 0.02) continue;
            if (p.t > midEnd + 0.05) break;
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          }
          const midAlpha = f.midBright * (0.7 + 0.3 * Math.sin(time * 0.6 + f.phase + 1));
          const midGrey = Math.floor(130 + f.midBright * 100);
          ctx.strokeStyle = `rgba(${midGrey}, ${midGrey}, ${midGrey + 8}, ${midAlpha})`;
          ctx.lineWidth = f.midWidth;
          ctx.stroke();

          // Draw outer zone — fades out toward noise ring
          ctx.beginPath();
          started = false;
          for (const p of points) {
            if (p.t < midEnd - 0.02) continue;
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          }
          // Fade: full at midEnd, zero at end
          const outerFade = 0.7;
          const outerAlpha = f.outerBright * outerFade * (0.6 + 0.4 * Math.sin(time * 0.5 + f.phase + 2));
          const outerGrey = Math.floor(110 + f.outerBright * 120);
          ctx.strokeStyle = `rgba(${outerGrey}, ${outerGrey}, ${outerGrey + 10}, ${outerAlpha})`;
          ctx.lineWidth = f.outerWidth;
          ctx.stroke();
        }
      };

      drawFibers(fibers);
      drawFibers(fineFibers);

      // Subtle collarette ring (boundary between inner and mid zone)
      const collaretteR = irisInnerR + (irisOuterR - irisInnerR) * innerEnd;
      ctx.beginPath();
      ctx.arc(cx, cy, collaretteR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(160, 160, 165, ${0.06 + Math.sin(time * 1.2) * 0.02})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // A couple more subtle fold rings
      for (let ring = 0; ring < 3; ring++) {
        const t = 0.15 + ring * 0.2;
        const r = irisInnerR + (irisOuterR - irisInnerR) * t;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(140, 140, 148, ${0.025 + Math.sin(time * 1.5 + ring * 2) * 0.01})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Drifting particles
      for (const p of driftParticles) {
        p.angle += p.speed;
        p.radius += p.drift;
        if (p.radius < pupilR) {
          p.radius = irisInnerR + Math.random() * (irisOuterR - irisInnerR + 80);
          p.angle = Math.random() * Math.PI * 2;
          p.brightness = Math.random();
        }
        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius;
        const distFade = Math.min(1, (p.radius - pupilR) / 50);
        const flicker = 0.5 + 0.5 * Math.sin(time * 8 + p.angle * 5);
        const alpha = p.brightness * distFade * flicker * 0.35;
        const grey = Math.floor(150 + p.brightness * 105);
        ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * distFade, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flashes
      if (Math.random() < 0.025) {
        flashes.push({
          angle: Math.random() * Math.PI * 2,
          radius: irisInnerR + Math.random() * (irisOuterR - irisInnerR),
          life: 0, maxLife: 25 + Math.random() * 50,
          brightness: 0.3 + Math.random() * 0.5,
        });
      }
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life++;
        if (f.life > f.maxLife) { flashes.splice(i, 1); continue; }
        const progress = f.life / f.maxLife;
        const alpha = Math.min(1, progress * 5) * (1 - progress) * f.brightness * 0.2;
        const x = cx + Math.cos(f.angle + time * 0.1) * f.radius;
        const y = cy + Math.sin(f.angle + time * 0.1) * f.radius;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 10 + f.brightness * 15);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.4, `rgba(180, 180, 190, ${alpha * 0.4})`);
        grad.addColorStop(1, "rgba(100, 100, 110, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 10 + f.brightness * 15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pupil
      const pupilGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pupilR * 1.4);
      pupilGrad.addColorStop(0, "rgba(0, 0, 0, 1)");
      pupilGrad.addColorStop(0.65, "rgba(0, 0, 0, 1)");
      pupilGrad.addColorStop(0.85, "rgba(0, 0, 0, 0.85)");
      pupilGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = pupilGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, pupilR * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Subtle light reflection
      const rx = cx - pupilR * 0.3;
      const ry = cy - pupilR * 0.35;
      const rGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, pupilR * 0.35);
      rGrad.addColorStop(0, `rgba(255, 255, 255, ${0.06 + Math.sin(time * 1.5) * 0.02})`);
      rGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, pupilR * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Vignette
      const vigR = Math.max(w, h) * 0.55;
      const vig = ctx.createRadialGradient(cx, cy, vigR * 0.35, cx, cy, vigR * 1.1);
      vig.addColorStop(0, "rgba(0, 0, 0, 0)");
      vig.addColorStop(1, "rgba(0, 0, 0, 0.8)");
      ctx.fillStyle = vig;
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
