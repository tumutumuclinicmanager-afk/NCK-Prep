import React, { useEffect, useRef } from 'react';

export interface CrystalizedBallProps {
  preset?: string;
  color?: string;
  size?: number;
  crackle?: number;
  fill?: number;
  interactive?: boolean;
  hoverStrength?: number;
  strands?: number;
  flares?: number;
  glow?: number;
  sparks?: number;
  particleCount?: number;
  motion?: string;
  particleShape?: string;
  depth?: number;
  sway?: number;
  twinkle?: number;
  haze?: number;
  dustSpeed?: number;
  speed?: number;
  intro?: boolean;
  paused?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function CrystalizedBall({
  preset = "plasma",
  color = "#F25BD0",
  size = 0.7,
  crackle = 0.85,
  fill = 0.5,
  interactive = true,
  hoverStrength = 0.7,
  strands = 6,
  flares = 0.65,
  glow = 0.9,
  sparks = 0.6,
  particleCount = 15000,
  motion = "rise",
  particleShape = "square",
  depth = 0.6,
  sway = 0.5,
  twinkle = 0.5,
  haze = 0.7,
  dustSpeed = 1,
  speed = 1,
  intro = true,
  paused = false,
  className = "",
  style = {},
  children
}: CrystalizedBallProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 600;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      mouseRef.current.targetX = x * hoverStrength;
      mouseRef.current.targetY = y * hoverStrength;
    };

    const el = canvas.parentElement || window;
    el.addEventListener('mousemove', handleMouseMove as EventListener);

    // Initialize particles
    const actualParticles = Math.min(particleCount, 3000); // optimized performance for 60fps canvas
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      baseAngle: number;
      radius: number;
      speedY: number;
      size: number;
      alpha: number;
    }> = [];

    const sphereRadius = Math.min(width, height) * 0.35 * size;

    for (let i = 0; i < actualParticles; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = sphereRadius * (0.3 + 0.7 * Math.cbrt(Math.random()));

      particles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseAngle: theta,
        radius: r,
        speedY: (Math.random() - 0.5) * dustSpeed * speed,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    let startTime = Date.now();

    const render = () => {
      if (!paused) {
        const now = Date.now();
        const elapsed = (now - startTime) * 0.001 * speed;

        // Smooth mouse damping
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

        ctx.clearRect(0, 0, width, height);

        // Background gradient / haze
        const bgGrad = ctx.createRadialGradient(
          width / 2, height / 2, 10,
          width / 2, height / 2, Math.max(width, height) * 0.7
        );
        bgGrad.addColorStop(0, '#0a0514');
        bgGrad.addColorStop(1, '#020108');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2 + mouseRef.current.x * 100;
        const centerY = height / 2 + mouseRef.current.y * 100;

        // Outer Glow
        if (glow > 0) {
          const glowGrad = ctx.createRadialGradient(
            centerX, centerY, sphereRadius * 0.2,
            centerX, centerY, sphereRadius * 1.6
          );
          glowGrad.addColorStop(0, color + Math.floor(glow * 100).toString(16).padStart(2, '0'));
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.fillRect(0, 0, width, height);
        }

        // Render Crystalized Ball Core / Strands
        ctx.save();
        ctx.translate(centerX, centerY);

        // Rotation angles
        const rotX = elapsed * 0.2 + mouseRef.current.y * 2;
        const rotY = elapsed * 0.3 + mouseRef.current.x * 2;

        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);

        // Sort particles by Z for depth
        const projected = particles.map(p => {
          // Motion rise / sway
          let py = p.y;
          if (motion === 'rise') {
            py -= (elapsed * 20 * dustSpeed) % (sphereRadius * 2) - sphereRadius;
          }

          // 3D rotation
          const x1 = p.x * cosY - p.z * sinY;
          const z1 = p.z * cosY + p.x * sinY;
          const y1 = py * cosX - z1 * sinX;
          const z2 = z1 * cosX + py * sinX;

          const perspective = 600 / (600 + z2);
          return {
            x: x1 * perspective,
            y: y1 * perspective,
            z: z2,
            size: p.size * perspective,
            alpha: p.alpha * (0.5 + 0.5 * (z2 / sphereRadius + 1))
          };
        });

        projected.sort((a, b) => a.z - b.z);

        // Draw crystal particles
        for (let i = 0; i < projected.length; i++) {
          const pt = projected[i];
          ctx.fillStyle = color;
          ctx.globalAlpha = Math.min(1, Math.max(0.1, pt.alpha * twinkle));

          if (particleShape === 'square') {
            ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
          } else {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Draw energetic crystal strands / plasma filaments
        ctx.globalAlpha = flares * 0.5;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        for (let s = 0; s < strands; s++) {
          const angle = (s / strands) * Math.PI * 2 + elapsed * 0.5;
          ctx.beginPath();
          for (let r = 0; r < sphereRadius; r += 10) {
            const sx = Math.cos(angle + r * 0.01) * r;
            const sy = Math.sin(angle + r * 0.01) * r;
            if (r === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      const cleanEl = canvas.parentElement || window;
      cleanEl.removeEventListener('mousemove', handleMouseMove as EventListener);
      cancelAnimationFrame(animationFrameId);
    };
  }, [preset, color, size, crackle, fill, interactive, hoverStrength, strands, flares, glow, sparks, particleCount, motion, particleShape, depth, sway, twinkle, haze, dustSpeed, speed, intro, paused]);

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ width: '100%', height: '100%', position: 'relative', ...style }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
