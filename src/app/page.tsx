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

    // Each fiber has harmonic parameters per zone for cymatics-style paths
    const fiberCount = 500;
    const fibers: {
      angle: number;
      // Inner zone: high-order harmonics, tight resonance patterns
      innerH1: number; innerH2: number; innerH3: number;
      innerA1: number; innerA2: number; innerA3: number;
      innerWidth: number; innerBright: number;
      // Mid zone: different harmonic ratios, broader curves
      midH1: number; midH2: number; midH3: number;
      midA1: number; midA2: number; midA3: number;
      midWidth: number; midBright: number;
      // Outer zone: gentle, feathery (stays as-is)
      outerWaveFreq: number; outerWaveAmp: number;
      outerWidth: number; outerBright: number;
      lengthMul: number;
      phase: number;
    }[] = [];

    for (let i = 0; i < fiberCount; i++) {
      const baseAngle = (i / fiberCount) * Math.PI * 2;
      // Pick harmonic "families" — nearby fibers share similar harmonics
      const family = Math.floor(i / 8);
      const familySeed = family * 0.7;

      fibers.push({
        angle: baseAngle + (Math.random() - 0.5) * 0.012,
        // Inner: 3-harmonic cymatics — high freq, creates tight looping patterns
        innerH1: 3 + Math.floor(Math.sin(familySeed) * 2 + 3) + Math.random() * 2,
        innerH2: 5 + Math.floor(Math.cos(familySeed * 1.3) * 3 + 4) + Math.random() * 2,
        innerH3: 8 + Math.floor(Math.sin(familySeed * 2.1) * 3 + 4) + Math.random() * 3,
        innerA1: 8 + Math.random() * 14,
        innerA2: 4 + Math.random() * 10,
        innerA3: 2 + Math.random() * 5,
        innerWidth: 0.6 + Math.random() * 1.2,
        innerBright: 0.12 + Math.random() * 0.18,
        // Mid: different harmonic ratios — broader, more sweeping curves
        midH1: 1.5 + Math.floor(Math.cos(familySeed * 0.8) * 2 + 2) + Math.random() * 1.5,
        midH2: 3 + Math.floor(Math.sin(familySeed * 1.7) * 2 + 3) + Math.random() * 2,
        midH3: 5 + Math.floor(Math.cos(familySeed * 2.5) * 2 + 3) + Math.random() * 2,
        midA1: 12 + Math.random() * 20,
        midA2: 6 + Math.random() * 12,
        midA3: 3 + Math.random() * 6,
        midWidth: 0.4 + Math.random() * 0.8,
        midBright: 0.08 + Math.random() * 0.14,
        // Outer: gentle feathery
        outerWaveFreq: 1.5 + Math.random() * 3,
        outerWaveAmp: 0.5 + Math.random() * 2,
        outerWidth: 0.2 + Math.random() * 0.5,
        outerBright: 0.06 + Math.random() * 0.16,
        lengthMul: 1.4 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Fine fill fibers
    const fineFibers: typeof fibers = [];
    for (let i = 0; i < 600; i++) {
      const family = Math.floor(Math.random() * 60);
      const familySeed = family * 0.7;
      fineFibers.push({
        angle: Math.random() * Math.PI * 2,
        innerH1: 4 + Math.floor(Math.sin(familySeed) * 2 + 3) + Math.random() * 3,
        innerH2: 7 + Math.floor(Math.cos(familySeed * 1.5) * 3) + Math.random() * 3,
        innerH3: 10 + Math.random() * 5,
        innerA1: 5 + Math.random() * 10,
        innerA2: 3 + Math.random() * 6,
        innerA3: 1 + Math.random() * 3,
        innerWidth: 0.2 + Math.random() * 0.4,
        innerBright: 0.04 + Math.random() * 0.08,
        midH1: 2 + Math.random() * 3,
        midH2: 4 + Math.random() * 3,
        midH3: 6 + Math.random() * 3,
        midA1: 8 + Math.random() * 12,
        midA2: 4 + Math.random() * 8,
        midA3: 2 + Math.random() * 4,
        midWidth: 0.15 + Math.random() * 0.3,
        midBright: 0.03 + Math.random() * 0.06,
        outerWaveFreq: 2 + Math.random() * 4,
        outerWaveAmp: 0.3 + Math.random() * 1.5,
        outerWidth: 0.1 + Math.random() * 0.25,
        outerBright: 0.02 + Math.random() * 0.08,
        lengthMul: 1.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Stars
    const stars: { x: number; y: number; size: number; brightness: number; twinkleSpeed: number; phase: number }[] = [];
    const initStars = (w: number, h: number) => {
      stars.length = 0;
      for (let i = 0; i < 1200; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          size: 0.3 + Math.random() * 1.5,
          brightness: 0.2 + Math.random() * 0.8,
          twinkleSpeed: 0.5 + Math.random() * 3,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    // Drift particles
    const driftParticles: { angle: number; radius: number; speed: number; brightness: number; size: number; drift: number }[] = [];
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
      const irisSpan = irisOuterR - irisInnerR;

      const innerEnd = 0.075;
      const midEnd = 0.6;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      time += 0.002;

      // Stars
      for (const s of stars) {
        const twinkle = 0.3 + 0.7 * Math.pow(Math.sin(time * s.twinkleSpeed + s.phase), 2);
        const grey = Math.floor(180 + s.brightness * 75);
        ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${s.brightness * twinkle})`;
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
      ctx.rotate(time * 0.08);
      ctx.drawImage(noiseCanvas2, -noiseSize / 2, -noiseSize / 2);
      ctx.restore();

      // Draw cymatics-style fibers
      const drawFibers = (fiberList: typeof fibers) => {
        for (const f of fiberList) {
          const totalLen = irisSpan * f.lengthMul;
          const segments = 60;
          const p = f.phase;
          const slowT = time * 0.3;

          // Compute all points with cymatics displacement
          const points: { x: number; y: number; t: number }[] = [];

          for (let s = 0; s <= segments; s++) {
            const t = s / segments;
            const r = irisInnerR + t * totalLen;

            let angularOffset: number;

            if (t < innerEnd) {
              // Inner zone: high-order harmonics — tight resonance patterns
              // Like Chladni plate at high frequency
              const localT = t / innerEnd; // 0-1 within zone
              // Smoothly start from 0 displacement at pupil edge
              const envelope = Math.sin(localT * Math.PI);
              const wave =
                Math.sin(localT * f.innerH1 * Math.PI + p + slowT) * f.innerA1 +
                Math.sin(localT * f.innerH2 * Math.PI + p * 1.7 + slowT * 0.7) * f.innerA2 +
                Math.sin(localT * f.innerH3 * Math.PI + p * 2.3 + slowT * 0.5) * f.innerA3;
              angularOffset = (wave * envelope) / r;

            } else if (t < midEnd) {
              // Mid zone: different harmonic family — broader sweeping curves
              const localT = (t - innerEnd) / (midEnd - innerEnd);
              const envelope = Math.sin(localT * Math.PI);
              // Calculate where inner zone ended to ensure connection
              const innerEndT = innerEnd / innerEnd;
              const innerEndEnv = Math.sin(innerEndT * Math.PI); // = 0 at boundary
              const wave =
                Math.sin(localT * f.midH1 * Math.PI + p * 0.8 + slowT * 0.8) * f.midA1 +
                Math.sin(localT * f.midH2 * Math.PI + p * 1.4 + slowT * 0.6) * f.midA2 +
                Math.sin(localT * f.midH3 * Math.PI + p * 2.0 + slowT * 0.4) * f.midA3;
              angularOffset = (wave * envelope) / r;

            } else {
              // Outer zone: straight lines extending into noise ring
              const localT = (t - midEnd) / (1 - midEnd);
              const envelope = Math.sin(localT * Math.PI) * 0.3;
              const wave = Math.sin(localT * f.outerWaveFreq * Math.PI + p) * f.outerWaveAmp;
              angularOffset = (wave * envelope) / r;
            }

            const angle = f.angle + angularOffset;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            points.push({ x, y, t });
          }

          // Draw inner zone
          ctx.beginPath();
          let started = false;
          for (const pt of points) {
            if (pt.t > innerEnd + 0.02) break;
            if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
            else ctx.lineTo(pt.x, pt.y);
          }
          const innerR = Math.floor(180 + f.innerBright * 75);
          const innerG = Math.floor(140 + f.innerBright * 50);
          const innerB = Math.floor(40 + f.innerBright * 20);
          ctx.strokeStyle = `rgba(${innerR}, ${innerG}, ${innerB}, ${f.innerBright * 0.5})`;
          ctx.lineWidth = f.innerWidth;
          ctx.stroke();

          // Draw mid zone
          ctx.beginPath();
          started = false;
          for (const pt of points) {
            if (pt.t < innerEnd - 0.01) continue;
            if (pt.t > midEnd + 0.02) break;
            if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
            else ctx.lineTo(pt.x, pt.y);
          }
          const midGrey = Math.floor(130 + f.midBright * 220);
          ctx.strokeStyle = `rgba(${midGrey}, ${midGrey}, ${midGrey + 8}, ${f.midBright})`;
          ctx.lineWidth = f.midWidth;
          ctx.stroke();

          // Draw outer zone
          ctx.beginPath();
          started = false;
          for (const pt of points) {
            if (pt.t < midEnd - 0.01) continue;
            if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
            else ctx.lineTo(pt.x, pt.y);
          }
          const outerGrey = Math.floor(110 + f.outerBright * 250);
          ctx.strokeStyle = `rgba(${outerGrey}, ${outerGrey}, ${outerGrey + 10}, ${f.outerBright})`;
          ctx.lineWidth = f.outerWidth;
          ctx.stroke();
        }
      };

      drawFibers(fibers);
      drawFibers(fineFibers);

      // Very subtle fold rings (40% of previous opacity)
      const collaretteR = irisInnerR + irisSpan * innerEnd;
      ctx.beginPath();
      ctx.arc(cx, cy, collaretteR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(160, 160, 165, ${0.024 + Math.sin(time * 1.2) * 0.008})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let ring = 0; ring < 3; ring++) {
        const t = 0.15 + ring * 0.2;
        const r = irisInnerR + irisSpan * t;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(140, 140, 148, ${0.01 + Math.sin(time * 1.5 + ring * 2) * 0.004})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Drift particles
      for (const dp of driftParticles) {
        dp.angle += dp.speed;
        dp.radius += dp.drift;
        if (dp.radius < pupilR) {
          dp.radius = irisInnerR + Math.random() * (irisOuterR - irisInnerR + 80);
          dp.angle = Math.random() * Math.PI * 2;
          dp.brightness = Math.random();
        }
        const x = cx + Math.cos(dp.angle) * dp.radius;
        const y = cy + Math.sin(dp.angle) * dp.radius;
        const distFade = Math.min(1, (dp.radius - pupilR) / 50);
        const flicker = 0.5 + 0.5 * Math.sin(time * 8 + dp.angle * 5);
        const grey = Math.floor(150 + dp.brightness * 105);
        ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${dp.brightness * distFade * flicker * 0.35})`;
        ctx.beginPath();
        ctx.arc(x, y, dp.size * distFade, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flashes
      if (Math.random() < 0.025) {
        flashes.push({
          angle: Math.random() * Math.PI * 2,
          radius: irisInnerR + Math.random() * irisSpan,
          life: 0, maxLife: 25 + Math.random() * 50,
          brightness: 0.3 + Math.random() * 0.5,
        });
      }
      for (let i = flashes.length - 1; i >= 0; i--) {
        const fl = flashes[i];
        fl.life++;
        if (fl.life > fl.maxLife) { flashes.splice(i, 1); continue; }
        const progress = fl.life / fl.maxLife;
        const alpha = Math.min(1, progress * 5) * (1 - progress) * fl.brightness * 0.2;
        const x = cx + Math.cos(fl.angle + time * 0.1) * fl.radius;
        const y = cy + Math.sin(fl.angle + time * 0.1) * fl.radius;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 10 + fl.brightness * 15);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.4, `rgba(180, 180, 190, ${alpha * 0.4})`);
        grad.addColorStop(1, "rgba(100, 100, 110, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 10 + fl.brightness * 15, 0, Math.PI * 2);
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

      // Reflection
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
