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
        innerWidth: 0.4 + Math.random() * 0.8,
        innerBright: 0.06 + Math.random() * 0.1,
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

    // Transition fibers — bridge inner spinning angles into mid squiggles
    const transitionFibers: typeof fibers = [];
    for (let i = 0; i < 350; i++) {
      const baseAngle = (i / 350) * Math.PI * 2;
      const family = Math.floor(i / 6);
      const familySeed = family * 0.7;
      transitionFibers.push({
        angle: baseAngle + (Math.random() - 0.5) * 0.015,
        innerH1: 3 + Math.floor(Math.sin(familySeed) * 2 + 3) + Math.random() * 2,
        innerH2: 5 + Math.floor(Math.cos(familySeed * 1.3) * 3 + 4) + Math.random() * 2,
        innerH3: 8 + Math.floor(Math.sin(familySeed * 2.1) * 3 + 4) + Math.random() * 3,
        innerA1: 6 + Math.random() * 10,
        innerA2: 3 + Math.random() * 7,
        innerA3: 1.5 + Math.random() * 4,
        innerWidth: 0.3 + Math.random() * 0.6,
        innerBright: 0.05 + Math.random() * 0.08,
        midH1: 1.5 + Math.floor(Math.cos(familySeed * 0.8) * 2 + 2) + Math.random() * 1.5,
        midH2: 3 + Math.floor(Math.sin(familySeed * 1.7) * 2 + 3) + Math.random() * 2,
        midH3: 5 + Math.floor(Math.cos(familySeed * 2.5) * 2 + 3) + Math.random() * 2,
        midA1: 10 + Math.random() * 16,
        midA2: 5 + Math.random() * 10,
        midA3: 2.5 + Math.random() * 5,
        midWidth: 0.25 + Math.random() * 0.5,
        midBright: 0.04 + Math.random() * 0.07,
        outerWaveFreq: 1.5 + Math.random() * 3,
        outerWaveAmp: 0.5 + Math.random() * 2,
        outerWidth: 0.15 + Math.random() * 0.35,
        outerBright: 0.03 + Math.random() * 0.08,
        lengthMul: 0.5 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Stars — spread across a huge area so zooming out reveals more
    const stars: { x: number; y: number; size: number; brightness: number; twinkleSpeed: number; phase: number }[] = [];
    const initStars = (w: number, h: number) => {
      stars.length = 0;
      const spread = 10; // 10x screen size in each direction
      for (let i = 0; i < 4000; i++) {
        stars.push({
          x: w / 2 + (Math.random() - 0.5) * w * spread,
          y: h / 2 + (Math.random() - 0.5) * h * spread,
          size: 0.3 + Math.random() * 1.5,
          brightness: 0.2 + Math.random() * 0.8,
          twinkleSpeed: 0.5 + Math.random() * 3,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    // Fog/cloud noise — large ambient texture that circles outside the eye
    let fogCanvas: HTMLCanvasElement;
    const buildFogTexture = (size: number) => {
      fogCanvas = document.createElement("canvas");
      fogCanvas.width = size;
      fogCanvas.height = size;
      const fctx = fogCanvas.getContext("2d")!;
      const imageData = fctx.createImageData(size, size);
      const data = imageData.data;
      const ctr = size / 2;
      // Multiple octaves of noise for cloud-like feel
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = x - ctr;
          const dy = y - ctr;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const idx = (y * size + x) * 4;
          const innerR = size * 0.15;
          const outerR = size * 0.48;

          if (dist > innerR && dist < outerR) {
            const ringMid = (innerR + outerR) / 2;
            const ringHalf = (outerR - innerR) / 2;
            const ringPos = 1 - Math.abs(dist - ringMid) / ringHalf;
            const falloff = Math.pow(ringPos, 1.5);

            // Multi-scale noise for cloudiness
            const n1 = Math.random();
            const n2 = Math.random();
            const combined = n1 * 0.6 + (n2 > 0.7 ? n2 : n2 * 0.1) * 0.4;
            const val = Math.floor(combined * 100 + 30);

            data[idx] = val;
            data[idx + 1] = val;
            data[idx + 2] = val + 5;
            data[idx + 3] = Math.floor(falloff * combined * 20);
          }
        }
      }
      fctx.putImageData(imageData, 0, 0);
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
      noiseCanvas = buildNoiseTexture(texSize, { innerR: texSize * 0.084, outerR: texSize * 0.228, maxAlpha: 80, clumpy: false });
      noiseCanvas2 = buildNoiseTexture(texSize, { innerR: texSize * 0.072, outerR: texSize * 0.21, maxAlpha: 60, clumpy: true });
      buildFogTexture(texSize);
      initStars(canvas.width, canvas.height);
      initDrift();
    };
    resize();
    window.addEventListener("resize", resize);

    // Zoom and pan state
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let panStartX = 0;
    let panStartY = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Zoom toward mouse position
      const prevZoom = zoom;
      const zoomFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      zoom = Math.max(0.05, Math.min(500, zoom * zoomFactor));

      // Adjust pan so zoom centers on mouse position
      const ratio = zoom / prevZoom;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      panX = (mouseX - cx) * (1 - ratio) + panX * ratio;
      panY = (mouseY - cy) * (1 - ratio) + panY * ratio;
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      panStartX = panX;
      panStartY = panY;
      canvas.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      panX = panStartX + (e.clientX - dragStartX);
      panY = panStartY + (e.clientY - dragStartY);
    };

    const onMouseUp = () => {
      isDragging = false;
      canvas.style.cursor = "grab";
    };

    // Touch support for pinch zoom and drag
    let lastTouchDist = 0;
    let lastTouchMidX = 0;
    let lastTouchMidY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        panStartX = panX;
        panStartY = panY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        lastTouchDist = Math.sqrt(dx * dx + dy * dy);
        lastTouchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        lastTouchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        panX = panStartX + (e.touches[0].clientX - dragStartX);
        panY = panStartY + (e.touches[0].clientY - dragStartY);
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        if (lastTouchDist > 0) {
          const prevZoom = zoom;
          zoom = Math.max(0.05, Math.min(500, zoom * (dist / lastTouchDist)));
          const ratio = zoom / prevZoom;
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          panX = (midX - cx) * (1 - ratio) + panX * ratio;
          panY = (midY - cy) * (1 - ratio) + panY * ratio;
        }
        lastTouchDist = dist;
        lastTouchMidX = midX;
        lastTouchMidY = midY;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      lastTouchDist = 0;
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.style.cursor = "grab";

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const minDim = Math.min(w, h);

      const pupilR = minDim * 0.036;
      const irisInnerR = pupilR + minDim * 0.007;
      const irisOuterR = minDim * 0.18;
      const irisSpan = irisOuterR - irisInnerR;

      const innerEnd = 0.224;
      const midEnd = 0.81;

      // Clear at screen level (before transform)
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      time += 0.002;

      // Parallax rotation speeds
      const starRot = time * 0.6;     // stars rotate fastest
      const fogRot = time * 0.35;     // clouds medium
      const eyeRot = time * 0.1;      // eye rotates slowest

      // === LAYER 1: Stars (outermost, fastest rotation) ===
      ctx.save();
      ctx.translate(panX, panY);
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);
      ctx.rotate(starRot);
      ctx.translate(-cx, -cy);

      for (const s of stars) {
        const twinkle = 0.3 + 0.7 * Math.pow(Math.sin(time * s.twinkleSpeed + s.phase), 2);
        const grey = Math.floor(180 + s.brightness * 75);
        ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${s.brightness * twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // === LAYER 2: Fog clouds (medium rotation) ===
      ctx.save();
      ctx.translate(panX, panY);
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);
      ctx.rotate(fogRot);
      ctx.drawImage(fogCanvas, -noiseSize / 2, -noiseSize / 2);
      // Second fog layer counter-rotating slightly
      ctx.rotate(-fogRot * 1.4);
      ctx.scale(1.15, 1.15);
      ctx.globalAlpha = 0.6;
      ctx.drawImage(fogCanvas, -noiseSize / 2, -noiseSize / 2);
      ctx.globalAlpha = 1;
      ctx.restore();

      // === LAYER 3: Eye (slowest rotation) ===
      ctx.save();
      ctx.translate(panX, panY);
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);
      ctx.rotate(eyeRot);
      ctx.translate(-cx, -cy);

      // Iris noise ring (rotates with eye + its own spin)
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

            // Crossfade band around inner/mid boundary
            const blendWidth = 0.12;
            const blendStart = innerEnd - blendWidth / 2;
            const blendEnd = innerEnd + blendWidth / 2;

            if (t < blendStart) {
              // Pure inner zone
              const localT = t / innerEnd;
              const envelope = Math.sin(localT * Math.PI);
              const wave =
                Math.sin(localT * f.innerH1 * Math.PI + p + slowT) * f.innerA1 +
                Math.sin(localT * f.innerH2 * Math.PI + p * 1.7 + slowT * 0.7) * f.innerA2 +
                Math.sin(localT * f.innerH3 * Math.PI + p * 2.3 + slowT * 0.5) * f.innerA3;
              angularOffset = (wave * envelope) / r;

            } else if (t < blendEnd) {
              // Crossfade: inner harmonics morphing into mid harmonics
              const crossT = (t - blendStart) / blendWidth; // 0-1 across blend
              const crossSmooth = crossT * crossT * (3 - 2 * crossT);

              const innerLocalT = t / innerEnd;
              const innerEnv = Math.sin(innerLocalT * Math.PI);
              const innerWave =
                Math.sin(innerLocalT * f.innerH1 * Math.PI + p + slowT) * f.innerA1 +
                Math.sin(innerLocalT * f.innerH2 * Math.PI + p * 1.7 + slowT * 0.7) * f.innerA2 +
                Math.sin(innerLocalT * f.innerH3 * Math.PI + p * 2.3 + slowT * 0.5) * f.innerA3;

              const midLocalT = Math.max(0, (t - innerEnd) / (midEnd - innerEnd));
              const midEnv = Math.sin(Math.max(0.001, midLocalT) * Math.PI);
              const midWave =
                Math.sin(midLocalT * f.midH1 * Math.PI + p * 0.8 + slowT * 0.8) * f.midA1 +
                Math.sin(midLocalT * f.midH2 * Math.PI + p * 1.4 + slowT * 0.6) * f.midA2 +
                Math.sin(midLocalT * f.midH3 * Math.PI + p * 2.0 + slowT * 0.4) * f.midA3;

              const blended = (innerWave * innerEnv) * (1 - crossSmooth) + (midWave * midEnv) * crossSmooth;
              angularOffset = blended / r;

            } else if (t < midEnd) {
              // Pure mid zone
              const localT = (t - innerEnd) / (midEnd - innerEnd);
              const envelope = Math.sin(localT * Math.PI);
              const wave =
                Math.sin(localT * f.midH1 * Math.PI + p * 0.8 + slowT * 0.8) * f.midA1 +
                Math.sin(localT * f.midH2 * Math.PI + p * 1.4 + slowT * 0.6) * f.midA2 +
                Math.sin(localT * f.midH3 * Math.PI + p * 2.0 + slowT * 0.4) * f.midA3;
              angularOffset = (wave * envelope) / r;

            } else {
              // Outer zone: continue mid harmonics with dampening
              // Pick up where mid zone left off and gradually settle
              const localT = (t - midEnd) / (1 - midEnd);
              const midLocalT = 1.0; // continuation from end of mid zone
              const continuation = midLocalT + localT * 0.4; // slow crawl forward in the wave
              const dampen = 1 - localT * 0.7; // gradually reduce amplitude
              const envelope = Math.sin(continuation * Math.PI) * dampen;
              const wave =
                Math.sin(continuation * f.midH1 * Math.PI + p * 0.8 + slowT * 0.8) * f.midA1 +
                Math.sin(continuation * f.midH2 * Math.PI + p * 1.4 + slowT * 0.6) * f.midA2 +
                Math.sin(continuation * f.midH3 * Math.PI + p * 2.0 + slowT * 0.4) * f.midA3;
              angularOffset = (wave * envelope * 0.4) / r;
            }

            const angle = f.angle + angularOffset;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            points.push({ x, y, t });
          }

          // Draw entire fiber as one gold-to-silver gradient from iris to noise
          // Reduce alpha in inner zone to compensate for line density stacking
          const goldR = 180, goldG = 150, goldB = 60;
          const silverR = 155, silverG = 155, silverB = 163;
          for (let pi = 0; pi < points.length - 1; pi++) {
            const pt0 = points[pi];
            const pt1 = points[pi + 1];
            // Gold at 0, smoothly to silver by ~0.8
            const raw = Math.min(1, pt0.t / 0.8);
            const blend = raw * raw * (3 - 2 * raw); // smoothstep
            const r = Math.floor(goldR + blend * (silverR - goldR));
            const g = Math.floor(goldG + blend * (silverG - goldG));
            const b = Math.floor(goldB + blend * (silverB - goldB));
            // Fade alpha in inner zone where lines are dense and overlap
            const densityComp = pt0.t < innerEnd ? 0.45 : (pt0.t < innerEnd + 0.05 ? 0.45 + (pt0.t - innerEnd) / 0.05 * 0.55 : 1.0);
            const alpha = f.midBright * densityComp;
            ctx.beginPath();
            ctx.moveTo(pt0.x, pt0.y);
            ctx.lineTo(pt1.x, pt1.y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = f.midWidth;
            ctx.stroke();
          }
        }
      };

      drawFibers(fibers);
      drawFibers(fineFibers);
      drawFibers(transitionFibers);

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

      // End zoom/pan transform
      ctx.restore();

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
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
