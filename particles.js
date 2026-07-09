document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;

  let animationFrameId = 0;
  let particles = [];
  let width = 0;
  let height = 0;
  const mouse = { x: 0, y: 0, active: false };

  // Zobian VPN colors: #7c4dff (RGB: 124, 77, 255)
  const rColor = 124;
  const gColor = 77;
  const bColor = 255;

  const maxConnectionsDistance = 140;
  const mouseRepelDistance = 190;
  
  // Support retina displays with proper resolution scaling
  const dpr = window.devicePixelRatio || 1;

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getParticleCount() {
    return Math.max(40, Math.min(150, Math.round((width * height) / 14000)));
  }

  function initParticles() {
    particles = [];
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: randomRange(-0.4, 0.4),
        vy: randomRange(-0.4, 0.4),
        r: randomRange(1, 2.6)
      });
    }
  }

  function resizeCanvas() {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    width = window.innerWidth;
    height = window.innerHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function animate() {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw and move particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around wall boundaries softly
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      else if (p.x > width) { p.x = width; p.vx *= -1; }
      
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      else if (p.y > height) { p.y = height; p.vy *= -1; }

      // Mouse repulsion physics
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRepelDistance && dist > 0) {
          const force = (mouseRepelDistance - dist) / mouseRepelDistance * 1.4;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // Draw particle point
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rColor}, ${gColor}, ${bColor}, 0.9)`;
      ctx.fill();
    }

    // Connect close particles with lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < maxConnectionsDistance) {
          const alpha = (1 - dist / maxConnectionsDistance) * 0.5;
          ctx.strokeStyle = `rgba(${rColor}, ${gColor}, ${bColor}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Connect particle to user cursor
      if (mouse.active) {
        const p = particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRepelDistance) {
          const alpha = (1 - dist / mouseRepelDistance) * 0.6;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  function handleMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function handleMouseOut() {
    mouse.active = false;
  }

  function handleTouchMove(e) {
    if (e.touches[0]) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }

  function handleTouchEnd() {
    mouse.active = false;
  }

  resizeCanvas();
  animationFrameId = requestAnimationFrame(animate);

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseout", handleMouseOut);
  window.addEventListener("touchmove", handleTouchMove, { passive: true });
  window.addEventListener("touchend", handleTouchEnd);
});
