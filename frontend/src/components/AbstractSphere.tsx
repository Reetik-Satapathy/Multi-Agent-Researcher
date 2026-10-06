import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  size: number;
  champagne: boolean;
}

interface Orbiter {
  ring: number;
  angle: number;
  speed: number;
  size: number;
  champagne: boolean;
}

interface Ring {
  tiltX: number;
  tiltY: number;
  tiltZ: number;
  radius: number;
}

function rotate(x: number, y: number, z: number, rotX: number, rotY: number, rotZ: number) {
  const cosZ = Math.cos(rotZ);
  const sinZ = Math.sin(rotZ);
  let x1 = x * cosZ - y * sinZ;
  let y1 = x * sinZ + y * cosZ;

  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const z1 = y1;
  const x2 = x1 * cosY - z * sinY;
  const z2 = x1 * sinY + z * cosY;

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y2 = z1 * cosX - z2 * sinX;
  const z3 = z1 * sinX + z2 * cosX;

  return { x: x2, y: y2, z: z3 };
}

export const AbstractSphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId = 0;
    let cssSize = 320;
    let dpr = 1;
    let disposed = false;

    const points: Point3D[] = [];
    const orbiters: Orbiter[] = [];
    const rings: Ring[] = [
      { tiltX: 0.35, tiltY: 0.15, tiltZ: 0.4, radius: 1 },
      { tiltX: 1.05, tiltY: -0.2, tiltZ: -0.25, radius: 1.02 },
      { tiltX: -0.7, tiltY: 0.55, tiltZ: 0.15, radius: 0.97 },
      { tiltX: 0.2, tiltY: 1.15, tiltZ: -0.5, radius: 1.04 },
      { tiltX: 0.85, tiltY: 0.8, tiltZ: 0.9, radius: 0.94 },
    ];

    const seedPoints = (radius: number) => {
      points.length = 0;
      const shellCount = 220;
      const innerCount = 70;
      const phi = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < shellCount; i++) {
        const y = 1 - (i / (shellCount - 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = phi * i;
        points.push({
          x: Math.cos(theta) * radiusAtY * radius,
          y: y * radius,
          z: Math.sin(theta) * radiusAtY * radius,
          size: Math.random() * 0.9 + 0.35,
          champagne: Math.random() < 0.08,
        });
      }

      for (let i = 0; i < innerCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phiAng = Math.acos(2 * v - 1);
        const r = radius * (0.22 + Math.random() * 0.62);
        points.push({
          x: r * Math.sin(phiAng) * Math.cos(theta),
          y: r * Math.sin(phiAng) * Math.sin(theta),
          z: r * Math.cos(phiAng),
          size: Math.random() * 0.55 + 0.2,
          champagne: Math.random() < 0.1,
        });
      }

      orbiters.length = 0;
      for (let r = 0; r < rings.length; r++) {
        const count = r === 0 ? 10 : 6;
        for (let i = 0; i < count; i++) {
          orbiters.push({
            ring: r,
            angle: (i / count) * Math.PI * 2 + r,
            speed: 0.0032 + r * 0.00035,
            size: Math.random() * 0.8 + 0.7,
            champagne: Math.random() < 0.18,
          });
        }
      }
    };

    const resize = () => {
      const bounds = wrap.getBoundingClientRect();
      const available = Math.min(bounds.width, bounds.height);
      cssSize = Math.max(200, Math.min(available, 440));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = `${cssSize}px`;
      canvas.style.height = `${cssSize}px`;
      canvas.width = Math.floor(cssSize * dpr);
      canvas.height = Math.floor(cssSize * dpr);
      seedPoints(cssSize * 0.34);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    let rotY = 0.4;
    let rotX = 0.25;
    let time = 0;

    const project = (x: number, y: number, z: number, radius: number) => {
      const fov = cssSize * 0.92;
      const scale = fov / (fov + z + radius * 0.35);
      return {
        x: cssSize / 2 + x * scale,
        y: cssSize / 2 + y * scale,
        scale,
        z,
      };
    };

    const drawRibbon = (phase: number, width: number, alpha: number, champagne: boolean) => {
      const cx = cssSize / 2;
      const cy = cssSize / 2;
      const ampX = cssSize * 0.42;
      const ampY = cssSize * 0.22;
      ctx.beginPath();
      for (let i = 0; i <= 72; i++) {
        const t = i / 72;
        const a = t * Math.PI * 2 + time * 0.12 + phase;
        const swell = 1 + 0.08 * Math.sin(a * 2 + phase * 1.4);
        const x = cx + Math.cos(a) * ampX * swell;
        const y = cy + Math.sin(a * 0.95 + 0.3) * ampY * swell + Math.sin(a * 3 + time * 0.2) * cssSize * 0.028;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = champagne
        ? `rgba(184, 155, 98, ${alpha})`
        : `rgba(111, 155, 131, ${alpha})`;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const render = () => {
      if (disposed) return;

      time += 0.016;
      rotY += 0.0024;
      rotX += 0.0009;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssSize, cssSize);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const radius = cssSize * 0.34;
      const cx = cssSize / 2;
      const cy = cssSize / 2;

      const core = ctx.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius * 1.35);
      core.addColorStop(0, 'rgba(49, 92, 75, 0.22)');
      core.addColorStop(0.38, 'rgba(16, 32, 25, 0.16)');
      core.addColorStop(1, 'rgba(5, 7, 6, 0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawRibbon(0.2, cssSize * 0.055, 0.055, false);
      drawRibbon(2.1, cssSize * 0.04, 0.04, false);
      drawRibbon(4.0, cssSize * 0.028, 0.028, true);
      ctx.restore();

      ctx.save();
      for (let r = 0; r < rings.length; r++) {
        const ring = rings[r];
        const arcStart = time * 0.07 + r * 0.9;
        const arcLength = Math.PI * 1.15;
        ctx.beginPath();
        for (let i = 0; i <= 56; i++) {
          const a = arcStart + (i / 56) * arcLength;
          const local = rotate(
            Math.cos(a) * radius * ring.radius,
            Math.sin(a) * radius * ring.radius,
            0,
            ring.tiltX + rotX,
            ring.tiltY + rotY,
            ring.tiltZ,
          );
          const p = project(local.x, local.y, local.z, radius);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = 'rgba(111, 155, 131, 0.22)';
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }
      ctx.restore();

      const projected = points.map((p) => {
        const r = rotate(p.x, p.y, p.z, rotX, rotY, 0);
        const screen = project(r.x, r.y, r.z, radius);
        return { ...screen, size: p.size, champagne: p.champagne };
      });
      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        const depth = Math.max(0.12, Math.min(0.85, (p.z + radius) / (radius * 2)));
        const alpha = 0.18 + depth * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.35, p.size * p.scale), 0, Math.PI * 2);
        ctx.fillStyle = p.champagne
          ? `rgba(184, 155, 98, ${alpha})`
          : `rgba(111, 155, 131, ${alpha})`;
        ctx.fill();
      }

      for (const orbiter of orbiters) {
        orbiter.angle += orbiter.speed;
        const ring = rings[orbiter.ring];
        const local = rotate(
          Math.cos(orbiter.angle) * radius * ring.radius * 1.06,
          Math.sin(orbiter.angle) * radius * ring.radius * 1.06,
          0,
          ring.tiltX + rotX,
          ring.tiltY + rotY,
          ring.tiltZ,
        );
        const p = project(local.x, local.y, local.z, radius);
        const alpha = 0.25 + 0.55 * p.scale;
        ctx.beginPath();
        ctx.arc(p.x, p.y, orbiter.size * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = orbiter.champagne
          ? `rgba(184, 155, 98, ${alpha})`
          : `rgba(242, 244, 239, ${alpha * 0.85})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative flex h-full w-full min-h-0 items-center justify-center">
      <div className="pointer-events-none absolute inset-0 overflow-visible">
        <svg
          className="absolute left-1/2 top-1/2 h-[150%] w-[170%] -translate-x-1/2 -translate-y-[46%] opacity-[0.55]"
          viewBox="0 0 900 700"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="rework-crystal-a" x1="80" y1="180" x2="820" y2="520" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#102019" stopOpacity="0" />
              <stop offset="35%" stopColor="#315C4B" stopOpacity="0.55" />
              <stop offset="62%" stopColor="#6F9B83" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#B89B62" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="rework-crystal-b" x1="60" y1="480" x2="840" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#050706" stopOpacity="0" />
              <stop offset="40%" stopColor="#102019" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#315C4B" stopOpacity="0.2" />
            </linearGradient>
            <filter id="rework-crystal-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
          <g
            filter="url(#rework-crystal-blur)"
            className="origin-center animate-spin-slow"
            style={{ transformOrigin: '450px 350px' }}
          >
            <path
              d="M70 390 C 180 120, 310 560, 470 300 S 760 90, 860 360"
              stroke="url(#rework-crystal-a)"
              strokeWidth="46"
              strokeLinecap="round"
            />
            <path
              d="M40 250 C 220 480, 390 80, 560 410 S 780 520, 880 240"
              stroke="url(#rework-crystal-b)"
              strokeWidth="34"
              strokeLinecap="round"
            />
          </g>
          <g
            filter="url(#rework-crystal-blur)"
            className="origin-center animate-spin-reverse-slow"
            style={{ transformOrigin: '450px 360px' }}
          >
            <path
              d="M120 470 C 280 220, 430 610, 640 280 S 820 190, 870 430"
              stroke="url(#rework-crystal-a)"
              strokeWidth="22"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>
        </svg>
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(111,155,131,0.35) 0%, rgba(16,32,25,0.12) 55%, transparent 100%)',
        }}
      />

      <canvas ref={canvasRef} className="relative z-10 block max-h-full max-w-full" aria-hidden="true" />
    </div>
  );
};
