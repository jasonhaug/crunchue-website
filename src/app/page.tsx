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

    // Offscreen noise ring texture (limbal ring / outer iris)
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
      const cx = size / 2;
      const cy = size / 2;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = x - cx;
          const dy = y - cy;
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

    // Iris fiber data - pre-generate for consistency
    const fiberCount = 400;
    const fibers: {
      angle: number;
      length: number; // 0-1 normalized
      width: number;
      brightness: number;
      waveFreq: number;
      waveAmp: number;
      phase: number;
    }[] = [];

    for (let i = 0; i < fiberCount; i++) {
      fibers.push({
        angle: (i / fiberCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.02,
        length: 0.5 + Math.random() * 0.5,
        width: 0.3 + Math.random() * 1.2,
        brightness: 0.15 + Math.random() * 0.55,
        waveFreq: 2 + Math.random() * 6,
        waveAmp: 1 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Secondary finer fibers
    const fineFibers: typeof fibers = [];
    for (let i = 0; i < 600; i++) {
      fineFibers.push({
        angle: Math.random() * Math.PI * 2,
        length: 0.3 + Math.random() * 0.7,
        width: 0.2 + Math.random() * 0.5,
        brightness: 0.05 + Math.random() * 0.25,
        waveFreq: 3 + Math.random() * 10,
        waveAmp: 0.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Star particles
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

    // Spiraling particles near iris
    const spiralParticles: {
      angle: number;
      radius: number;
      speed: number;
      brightness: number;
      size: number;
      drift: number;
    }[] = [];

    const initSpiralParticles = () => {
      spiralParticles.length = 0;
      for (let i = 0; i < 300; i++) {
        spiralParticles.push({
          angle: Math.random() * Math.PI * 2,
          radius: 30 + Math.random() * 350,
          speed: 0.0003 + Math.random() * 0.001,
          brightness: Math.random(),
          size: 0.4 + Math.random() * 1.2,
          drift: -0.02 - Math.random() * 0.06,
        });
      }
    };

    // Sporadic flashes
    const flashes: {
      angle: number;
      radius: number;
      life: number;
      maxLife: number;
      brightness: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const texSize = Math.max(canvas.width, canvas.height);
      noiseSize = texSize;
      noiseCanvas = buildNoiseTexture(texSize, {
        innerR: texSize * 0.14,
        outerR: texSize * 0.38,
        maxAlpha: 50,
        clumpy: false,
      });
      noiseCanvas2 = buildNoiseTexture(texSize, {
        innerR: texSize * 0.12,
        outerR: texSize * 0.35,
        maxAlpha: 38,
        clumpy: true,
      });
      initStars(canvas.width, canvas.height);
      initSpiralParticles();
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
      const irisInnerR = pupilR + minDim * 0.01;
      const irisOuterR = minDim * 0.28;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      time += 0.002;

      // Background stars
      for (const s of stars) {
        const twinkle = 0.3 + 0.7 * Math.pow(Math.sin(time * s.twinkleSpeed + s.phase), 2);
        const alpha = s.brightness * twinkle;
        const grey = Math.floor(180 + s.brightness * 75);
        ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Noise ring layers (outer iris / limbal texture)
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

      // Iris fibers - radial lines from pupil to outer iris
      const drawFiberSet = (fiberList: typeof fibers, globalAlphaMul: number) => {
        for (const f of fiberList) {
          const segments = 30;
          const startR = irisInnerR;
          const endR = irisInnerR + (irisOuterR - irisInnerR) * f.length;

          ctx.beginPath();
          for (let s = 0; s <= segments; s++) {
            const t = s / segments;
            const r = startR + t * (endR - startR);
            const wave = Math.sin(t * f.waveFreq + f.phase + time * 0.5) * f.waveAmp * t;
            const angle = f.angle + wave / r;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          // Fibers brighter near pupil, fade toward outer
          const alpha = f.brightness * globalAlphaMul;
          const grey = Math.floor(140 + f.brightness * 100);
          ctx.strokeStyle = `rgba(${grey}, ${grey}, ${grey + 8}, ${alpha})`;
          ctx.lineWidth = f.width;
          ctx.stroke();
        }
      };

      drawFiberSet(fibers, 0.45);
      drawFiberSet(fineFibers, 0.3);

      // Radial glow rings within iris (collarette / iris folds)
      for (let ring = 0; ring < 5; ring++) {
        const r = irisInnerR + ((irisOuterR - irisInnerR) * (0.2 + ring * 0.15));
        const wobble = Math.sin(time + ring * 1.5) * 1.5;
        ctx.beginPath();
        ctx.arc(cx + wobble * 0.3, cy + wobble * 0.3, r, 0, Math.PI * 2);
        const ringAlpha = 0.03 + Math.sin(time * 1.5 + ring) * 0.015;
        ctx.strokeStyle = `rgba(180, 180, 185, ${ringAlpha})`;
        ctx.lineWidth = 1 + Math.sin(ring + time) * 0.5;
        ctx.stroke();
      }

      // Spiral particles drifting near iris
      for (const p of spiralParticles) {
        p.angle += p.speed;
        p.radius += p.drift;

        if (p.radius < pupilR) {
          p.radius = irisInnerR + Math.random() * (irisOuterR - irisInnerR + 100);
          p.angle = Math.random() * Math.PI * 2;
          p.brightness = Math.random();
        }

        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius;

        const distFade = Math.min(1, (p.radius - pupilR) / 60);
        const flicker = 0.5 + 0.5 * Math.sin(time * 8 + p.angle * 5);
        const alpha = p.brightness * distFade * flicker * 0.4;

        const grey = Math.floor(150 + p.brightness * 105);
        ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * distFade, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sporadic light flashes
      if (Math.random() < 0.025) {
        flashes.push({
          angle: Math.random() * Math.PI * 2,
          radius: irisInnerR + Math.random() * (irisOuterR - irisInnerR),
          life: 0,
          maxLife: 25 + Math.random() * 50,
          brightness: 0.3 + Math.random() * 0.5,
        });
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life++;
        if (f.life > f.maxLife) {
          flashes.splice(i, 1);
          continue;
        }
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

      // Pupil - dark center with soft edge
      const pupilGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pupilR * 1.4);
      pupilGrad.addColorStop(0, "rgba(0, 0, 0, 1)");
      pupilGrad.addColorStop(0.65, "rgba(0, 0, 0, 1)");
      pupilGrad.addColorStop(0.85, "rgba(0, 0, 0, 0.85)");
      pupilGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = pupilGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, pupilR * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Subtle light reflection on pupil
      const reflectX = cx - pupilR * 0.3;
      const reflectY = cy - pupilR * 0.35;
      const reflGrad = ctx.createRadialGradient(reflectX, reflectY, 0, reflectX, reflectY, pupilR * 0.35);
      const reflAlpha = 0.06 + Math.sin(time * 1.5) * 0.02;
      reflGrad.addColorStop(0, `rgba(255, 255, 255, ${reflAlpha})`);
      reflGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = reflGrad;
      ctx.beginPath();
      ctx.arc(reflectX, reflectY, pupilR * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Outer vignette
      const vigR = Math.max(w, h) * 0.55;
      const vignette = ctx.createRadialGradient(cx, cy, vigR * 0.35, cx, cy, vigR * 1.1);
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.8)");
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
