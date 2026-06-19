export function launchConfetti(color = '#ffd700') {
  const canvas = document.getElementById('confetti');
  if (!canvas) return () => {};
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const particles = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 10 + 6,
    h: Math.random() * 6 + 4,
    c: Math.random() > 0.4 ? color : `hsl(${Math.random() * 360},85%,60%)`,
    rot: Math.random() * Math.PI * 2,
    rv: (Math.random() - 0.5) * 0.14,
    vy: Math.random() * 3 + 2,
    vx: (Math.random() - 0.5) * 2,
  }));

  let raf;
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.rv;
      if (p.y < canvas.height + 20) alive = true;
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (alive) raf = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();

  return () => cancelAnimationFrame(raf);
}