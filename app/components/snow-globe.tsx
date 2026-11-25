"use client";
import { useEffect, useRef } from "react";

type Flake = { x: number; y: number; r: number; b: number; vy: number; vx: number; p: number };

/** Neve em canvas que reage ao dedo/mouse, à inclinação e à sacudida do celular. */
export default function SnowGlobe() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, tilt = 0, last = performance.now(), lx = 0, ly = 0, lt = 0;
    const resize = () => { w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const mk = (y?: number): Flake => { const b = 22 + Math.random() * 40; return { x: Math.random() * w, y: y ?? -10, r: 1 + Math.random() * 3, b, vy: b, vx: 0, p: Math.random() * 6.28 }; };
    const flakes = Array.from({ length: Math.min(120, Math.round(w / 8)) }, () => mk(Math.random() * h));
    const push = (x: number, y: number, speed: number) => {
      for (const f of flakes) { const d = Math.hypot(f.x - x, f.y - y); if (d < 140) { const k = (1 - d / 140) * (80 + speed * 160); f.vx += ((f.x - x) / (d || 1)) * k; f.vy += ((f.y - y) / (d || 1)) * k * 0.6 - 30; } }
    };
    const onMove = (e: PointerEvent) => { const t = performance.now(); if (lt) push(e.clientX, e.clientY, Math.min(Math.hypot(e.clientX - lx, e.clientY - ly) / Math.max(t - lt, 8), 3)); lx = e.clientX; ly = e.clientY; lt = t; };
    const onDown = (e: PointerEvent) => { push(e.clientX, e.clientY, 3); askMotion(); };
    let lastMag = 0, listening = false;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity; if (!a) return;
      tilt = -(a.x || 0) * 6;
      const mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
      if (Math.abs(mag - lastMag) > 14) for (const f of flakes) { f.vx += (Math.random() - 0.5) * 700; f.vy = -120 - Math.random() * 380; }
      lastMag = mag;
    };
    const listen = () => { if (!listening) { listening = true; addEventListener("devicemotion", onMotion); } };
    const askMotion = () => {
      const DME = (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent;
      if (DME?.requestPermission) DME.requestPermission().then((r) => r === "granted" && listen()).catch(() => {});
    };
    const DMEx = (window as unknown as { DeviceMotionEvent?: { requestPermission?: unknown } }).DeviceMotionEvent;
    if (DMEx && !DMEx.requestPermission) listen();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = "rgba(255,255,255,.88)";
      for (const f of flakes) {
        f.vx += tilt * dt; f.vx *= 1 - dt * 1.6; f.vy += (f.b - f.vy) * dt * 1.2; f.p += dt;
        f.x += (f.vx + Math.sin(f.p) * 10) * dt; f.y += f.vy * dt;
        if (f.y > h + 10 || f.x < -20 || f.x > w + 20) Object.assign(f, mk(), { x: Math.random() * w });
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    addEventListener("resize", resize); addEventListener("pointermove", onMove); addEventListener("pointerdown", onDown);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); removeEventListener("pointermove", onMove); removeEventListener("pointerdown", onDown); removeEventListener("devicemotion", onMotion); };
  }, []);
  return <canvas ref={ref} className="snow-canvas" aria-hidden="true" />;
}
