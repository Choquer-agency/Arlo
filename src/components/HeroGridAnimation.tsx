'use client';

import { useRef, useEffect, useCallback } from 'react';

const CELL_SIZE = 75;
const FADE_RATE = 5.5;
const BASE_COLOR = 'rgba(0, 77, 67, 0.024)';
const HIGHLIGHT_COLOR = 'rgba(39, 234, 166, 0.7)';
const NEIGHBOR_CHANCE = 0.5;

interface FadingCell {
  col: number;
  row: number;
  opacity: number;
}

export default function HeroGridAnimation({ children }: { children?: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fadingCellsRef = useRef<FadingCell[]>([]);
  const mouseColRef = useRef<number>(-1);
  const mouseRowRef = useRef<number>(-1);
  const animFrameRef = useRef<number>(0);

  const getGridDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { cols: 0, rows: 0 };
    return {
      cols: Math.ceil(canvas.width / CELL_SIZE) + 1,
      rows: Math.ceil(canvas.height / CELL_SIZE) + 1,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newCol = Math.floor(x / CELL_SIZE);
      const newRow = Math.floor(y / CELL_SIZE);

      if (newCol !== mouseColRef.current || newRow !== mouseRowRef.current) {
        mouseColRef.current = newCol;
        mouseRowRef.current = newRow;

        // Add random neighbors
        const offsets = [-1, 0, 1];
        for (const dx of offsets) {
          for (const dy of offsets) {
            if (dx === 0 && dy === 0) continue;
            if (Math.random() < NEIGHBOR_CHANCE) {
              fadingCellsRef.current.push({
                col: newCol + dx,
                row: newRow + dy,
                opacity: 255,
              });
            }
          }
        }
      }
    };

    const handleMouseLeave = () => {
      mouseColRef.current = -1;
      mouseRowRef.current = -1;
    };

    const draw = () => {
      const { cols, rows } = getGridDimensions();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#EBFFF6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw base grid — white filled cells with faint blue stroke
      ctx.lineWidth = 1;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * CELL_SIZE + 0.5;
          const y = r * CELL_SIZE + 0.5;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
          ctx.strokeStyle = BASE_COLOR;
          ctx.strokeRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }

      // Draw fading neighbor strokes
      fadingCellsRef.current = fadingCellsRef.current.filter((cell) => {
        cell.opacity -= FADE_RATE;
        if (cell.opacity <= 0) return false;
        const alpha = cell.opacity / 255;
        ctx.strokeStyle = `rgba(39, 234, 166, ${alpha * 0.88})`;
        ctx.strokeRect(
          cell.col * CELL_SIZE + 0.5,
          cell.row * CELL_SIZE + 0.5,
          CELL_SIZE - 1,
          CELL_SIZE - 1
        );
        return true;
      });

      // Draw highlighted stroke under cursor
      if (mouseColRef.current >= 0 && mouseRowRef.current >= 0) {
        ctx.strokeStyle = HIGHLIGHT_COLOR;
        ctx.strokeRect(
          mouseColRef.current * CELL_SIZE + 0.5,
          mouseRowRef.current * CELL_SIZE + 0.5,
          CELL_SIZE - 1,
          CELL_SIZE - 1
        );
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, [getGridDimensions]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />
      {children}
      {/* Gradient fade at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: 'linear-gradient(to bottom, transparent, #ffffff)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
