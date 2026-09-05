import React, { useEffect, useRef } from 'react';

export type CelebrationType = 'six' | 'capture' | 'win';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
  shape: 'rect' | 'circle' | 'star';
  life: number;
  maxLife: number;
}

interface ConfettiEffectProps {
  trigger: { type: CelebrationType; timestamp: number } | null;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = [
      '#f59e0b', '#fbbf24', '#ef4444', '#10b981', 
      '#3b82f6', '#ec4899', '#8b5cf6', '#ffffff'
    ];

    const newParticles: Particle[] = [];

    if (trigger.type === 'six') {
      // Golden star burst from bottom center
      const startX = width / 2;
      const startY = height * 0.7;
      for (let i = 0; i < 40; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
        const speed = 7 + Math.random() * 9;
        newParticles.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 6 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 12,
          alpha: 1,
          shape: Math.random() > 0.4 ? 'star' : 'circle',
          life: 0,
          maxLife: 55 + Math.random() * 25
        });
      }
    } else if (trigger.type === 'capture') {
      // Fiery 360 burst from screen center
      const startX = width / 2;
      const startY = height / 2;
      const fieryColors = ['#ef4444', '#f97316', '#fbbf24', '#ffffff'];
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 11;
        newParticles.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 6,
          color: fieryColors[Math.floor(Math.random() * fieryColors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 15,
          alpha: 1,
          shape: 'circle',
          life: 0,
          maxLife: 45 + Math.random() * 20
        });
      }
    } else if (trigger.type === 'win') {
      // Royal shower across the whole width
      for (let i = 0; i < 120; i++) {
        newParticles.push({
          x: Math.random() * width,
          y: -20 - Math.random() * 100,
          vx: (Math.random() - 0.5) * 4,
          vy: 3 + Math.random() * 5,
          size: 8 + Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 10,
          alpha: 1,
          shape: Math.random() > 0.3 ? 'rect' : 'star',
          life: 0,
          maxLife: 120 + Math.random() * 60
        });
      }
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach(p => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Gravity
        p.vx *= 0.98; // Friction
        p.rotation += p.vRot;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          // Draw 4-point sparkle star
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(0, 0, p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, p.size);
          ctx.quadraticCurveTo(0, 0, -p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -p.size);
          ctx.fill();
        }

        ctx.restore();
      });

      // Filter out dead particles
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
    />
  );
};
