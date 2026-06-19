import { useRef, useEffect, useCallback } from 'react';

export default function ScratchCard({ category, catKey, prize, onReveal, revealed }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const revealedRef = useRef(false);

  const BRUSH = 36;
  const THRESH = 0.55;

  const drawLayer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#aaa');
    g.addColorStop(0.35, '#e2e2e2');
    g.addColorStop(0.5, '#f5f5f5');
    g.addColorStop(0.7, '#ccc');
    g.addColorStop(1, '#999');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (let x = 10; x < W; x += 18) {
      for (let y = 10; y < H; y += 18) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fill();
      }
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 14px Segoe UI';
    ctx.fillStyle = 'rgba(60,60,60,0.55)';
    ctx.fillText(
      `${category.icon}  ${category.label.toUpperCase()}  ${category.icon}`,
      W / 2,
      H / 2 - 16
    );
    ctx.font = 'bold 20px Segoe UI';
    ctx.fillStyle = 'rgba(60,60,60,0.8)';
    ctx.fillText('🪙  SCRATCH HERE  🪙', W / 2, H / 2 + 14);
  }, [category]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 460;
    canvas.height = rect.height || 200;
    revealedRef.current = false;
    drawLayer();
  }, [drawLayer, catKey]);

  useEffect(() => {
    if (revealed) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [revealed]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width;
    const sy = canvas.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - r.left) * sx,
      y: (src.clientY - r.top) * sy,
    };
  };

  const scratch = (x, y) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, BRUSH, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkReveal = () => {
    if (revealedRef.current) return;
    const canvas = canvasRef.current;
    const px = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    for (let i = 3; i < px.length; i += 4) {
      if (px[i] === 0) cleared++;
    }
    if (cleared / (canvas.width * canvas.height) >= THRESH) {
      revealedRef.current = true;
      onReveal();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <div className="step-label" style={{ marginBottom: 8 }}>
        ③ Scratch to Reveal
      </div>
      <div className={`scratch-wrap ${!prize ? 'locked' : ''}`}>
        <div className="prize-layer">
          <div className="prize-tag">{category?.label || '—'}</div>
          <div className="prize-icon">{category?.icon || ''}</div>
          <div className="prize-value">{prize || '?'}</div>
          <div className="prize-sub">{category?.sublabel || ''}</div>
        </div>
        <canvas
          id="scratchCanvas"
          ref={canvasRef}
          style={{ width: '100%', height: '200px' }}
          onMouseDown={e => {
            if (revealed) return;
            drawing.current = true;
            const { x, y } = getPos(e);
            scratch(x, y);
          }}
          onMouseMove={e => {
            if (!drawing.current || revealed) return;
            const { x, y } = getPos(e);
            scratch(x, y);
            checkReveal();
          }}
          onMouseUp={() => (drawing.current = false)}
          onMouseLeave={() => (drawing.current = false)}
          onTouchStart={e => {
            e.preventDefault();
            if (revealed) return;
            drawing.current = true;
            const { x, y } = getPos(e);
            scratch(x, y);
          }}
          onTouchMove={e => {
            e.preventDefault();
            if (!drawing.current || revealed) return;
            const { x, y } = getPos(e);
            scratch(x, y);
            checkReveal();
          }}
          onTouchEnd={() => (drawing.current = false)}
        />
      </div>
    </div>
  );
}