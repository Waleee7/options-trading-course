"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/lib/theme";

interface Particle {
  x: number;
  y: number;
  opacity: number;
  scale: number;
  rotation: number;
  vx: number;
  vy: number;
  life: number;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const lastSpawn = useRef(0);
  const animFrame = useRef<number>(0);
  const { theme } = useTheme();

  const spawnParticle = useCallback((x: number, y: number) => {
    particles.current.push({
      x,
      y,
      opacity: 0.7,
      scale: 0.6 + Math.random() * 0.5,
      rotation: -20 + Math.random() * 40,
      vx: -1 + Math.random() * 2,
      vy: -1.5 - Math.random() * 1.5,
      life: 1,
    });
    if (particles.current.length > 25) {
      particles.current.shift();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      const now = Date.now();
      if (now - lastSpawn.current > 60) {
        spawnParticle(e.clientX, e.clientY);
        lastSpawn.current = now;
      }
    };
    window.addEventListener("mousemove", handleMove);

    const isDark = theme === "dark";
    const color = isDark ? "rgba(234,179,8," : "rgba(202,138,4,";

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.life -= 0.018;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.opacity = Math.max(0, p.life * 0.7);
        p.scale *= 0.995;

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.font = `bold ${14 * p.scale}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = `${color}${p.opacity})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 0, 0);
        ctx.restore();
      }

      animFrame.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(animFrame.current);
    };
  }, [theme, spawnParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}
