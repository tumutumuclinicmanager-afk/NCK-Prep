import React, { useEffect, useRef } from 'react';

export interface GradientASCIIProps {
  colors?: string[];
  shape?: string;
  characters?: string;
  cellSize?: number;
  density?: number;
  glyphOpacity?: number;
  glow?: number;
  depthOfField?: number;
  flicker?: number;
  softness?: number;
  scale?: number;
  flow?: number;
  speed?: number;
  gradientOpacity?: number;
  grain?: number;
  variation?: number;
  mouseInteraction?: boolean;
  scrambleRadius?: number;
  clickEffect?: string;
  intro?: boolean;
  lightMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function GradientASCII({
  colors = ["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"],
  shape = "horizon",
  characters = " =+xX0S8#@",
  cellSize = 18,
  density = 0.8,
  glyphOpacity = 0.85,
  glow = 0.2,
  depthOfField = 0,
  flicker = 0.2,
  softness = 0.5,
  scale = 1,
  flow = 0.5,
  speed = 1,
  gradientOpacity = 0.9,
  grain = 0.08,
  variation = 0,
  mouseInteraction = true,
  scrambleRadius = 0.1,
  clickEffect = "wave",
  intro = true,
  lightMode = false,
  className = "",
  style = {},
  children
}: GradientASCIIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, clickX: -1000, clickY: -1000, clickTime: 0 });

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
      if (!mouseInteraction) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleClick = (e: MouseEvent) => {
      if (!mouseInteraction) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.clickX = e.clientX - rect.left;
      mouseRef.current.clickY = e.clientY - rect.top;
      mouseRef.current.clickTime = Date.now();
    };

    const el = canvas.parentElement || window;
    el.addEventListener('mousemove', handleMouseMove as EventListener);
    el.addEventListener('click', handleClick as EventListener);

    let startTime = Date.now();

    const render = () => {
      const now = Date.now();
      const elapsed = (now - startTime) * 0.001 * speed;

      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = lightMode ? '#f8fafc' : '#090d16';
      ctx.fillRect(0, 0, width, height);

      const effectiveCellSize = Math.max(8, Math.round(cellSize / scale));
      const cols = Math.floor(width / effectiveCellSize);
      const rows = Math.floor(height / effectiveCellSize);

      ctx.font = `${effectiveCellSize}px monospace`;
      ctx.textBaseline = 'top';

      const charList = characters || " =+xX0S8#@";
      const colorPalette = colors && colors.length > 0 ? colors : ["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * effectiveCellSize;
          const y = r * effectiveCellSize;

          // Normalized coordinates (-1 to 1)
          const nx = (c / cols) * 2 - 1;
          const ny = (r / rows) * 2 - 1;

          // Wave / flow pattern
          let wave = Math.sin(nx * 3 + elapsed * flow) * Math.cos(ny * 3 + elapsed * flow * 0.7);
          if (shape === 'horizon') {
            wave = ny + Math.sin(nx * 4 + elapsed * flow) * 0.3;
          }

          // Distance to mouse
          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.max(width, height) * scrambleRadius;
          let mouseInfluence = 0;
          if (mouseInteraction && dist < maxDist) {
            mouseInfluence = (1 - dist / maxDist);
          }

          // Click effect wave
          let clickWaveBonus = 0;
          if (clickEffect === 'wave' && mouseRef.current.clickTime > 0) {
            const timeSinceClick = (now - mouseRef.current.clickTime) * 0.001;
            const cdx = x - mouseRef.current.clickX;
            const cdy = y - mouseRef.current.clickY;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
            const waveRadius = timeSinceClick * 400;
            if (Math.abs(cdist - waveRadius) < 50) {
              clickWaveBonus = (1 - Math.abs(cdist - waveRadius) / 50) * 0.5;
            }
          }

          let val = (Math.sin(nx * 2 + ny * 2 + elapsed * speed + mouseInfluence * 3) + 1) * 0.5;
          val = Math.min(1, Math.max(0, val + clickWaveBonus));

          const charIndex = Math.floor(val * (charList.length - 1));
          const char = charList[charIndex] || '.';

          // Color selection based on position and wave
          const colorIndex = Math.floor(Math.abs(Math.sin(nx + ny + elapsed * 0.2)) * colorPalette.length) % colorPalette.length;
          const baseColor = colorPalette[colorIndex] || colorPalette[0];

          ctx.fillStyle = baseColor;
          ctx.globalAlpha = Math.min(1, Math.max(0.1, glyphOpacity + (Math.random() - 0.5) * flicker));
          ctx.fillText(char, x, y);
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      const cleanEl = canvas.parentElement || window;
      cleanEl.removeEventListener('mousemove', handleMouseMove as EventListener);
      cleanEl.removeEventListener('click', handleClick as EventListener);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colors, shape, characters, cellSize, density, glyphOpacity, glow, flicker, softness, scale, flow, speed, gradientOpacity, grain, variation, mouseInteraction, scrambleRadius, clickEffect, intro, lightMode]);

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
