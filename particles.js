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

  // Detect mobile device (screen width less than 768px)
  const isMobile = window.innerWidth < 768;

  // Optimize values for mobile screens to prevent clutter and save battery
  const maxConnectionsDistance = isMobile ? 90 : 140;
  const mouseRepelDistance = isMobile ? 80 : 190;
  
  // Support retina displays with proper resolution scaling
  const dpr = window.devicePixelRatio || 1;

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Get particle count based on screen area
  function getParticleCount() {
    const baseCount = Math.round((width * height) / 16000);
    if (isMobile) {
      // 15-30 particles is perfect for mobile screens to avoid lag and visual mess
      return Math.max(15, Math.min(30, baseCount));
    }
    return Math.max(40, Math.min(150, baseCount));
  }

  function initParticles() {
    particles = [];
    const count = getParticleCount();
    // Slow down particles on mobile for a calmer, less aggressive background
    const speedLimit = isMobile ? 0.2 : 0.4;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: randomRange(-speedLimit, speedLimit),
        vy: randomRange(-speedLimit, speedLimit),
        r: randomRange(1, 2.3)
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

      // Mouse repulsion physics (only if active and not mobile)
      if (mouse.active && !isMobile) {
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

      // Connect particle to user cursor (only if active and not mobile)
      if (mouse.active && !isMobile) {
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
  
  // Bind interaction events ONLY for PC / Desktop screens
  if (!isMobile) {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
  }

  // Mobile menu click helper to auto-close nav links when clicked
  const burger = document.getElementById("burgerBtn");
  const navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        burger.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  }

  // Floating CTA visibility based on scroll position (hides when reaching cta section or support section)
  const floatingCTA = document.getElementById("floatingCTA");
  const ctaBox = document.getElementById("ctaBox");
  if (floatingCTA) {
    window.addEventListener("scroll", () => {
      const scrollPos = window.scrollY;
      const isPastHero = scrollPos > 450;
      
      let isNearFooter = false;
      if (ctaBox) {
        const rect = ctaBox.getBoundingClientRect();
        // Hide button when the top of the cta-box block is visible in the viewport
        isNearFooter = rect.top < window.innerHeight - 50;
      } else {
        // Fallback: check if we are within 500px of page bottom
        isNearFooter = (window.innerHeight + scrollPos) >= (document.documentElement.scrollHeight - 500);
      }
      
      if (isPastHero && !isNearFooter) {
        floatingCTA.classList.add("visible");
      } else {
        floatingCTA.classList.remove("visible");
      }
    });
  }

  // ScrollSpy logic to highlight active section/page in navbar
  const sections = document.querySelectorAll("section[id]");
  const navAnchorLinks = document.querySelectorAll(".nav-links a[href^='#'], .nav-links a[href^='index.html#']");
  const navPagesLinks = document.querySelectorAll(".nav-links a[href$='.html']");
  
  // First, check if we are on a subpage like servers.html or faq.html
  const currentPath = window.location.pathname;
  let onSubpage = false;
  navPagesLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (currentPath.includes(href)) {
      link.classList.add("active");
      onSubpage = true;
    }
  });

  if (!onSubpage && navAnchorLinks.length > 0) {
    const updateActiveLink = () => {
      let currentSectionId = "";
      const scrollPos = window.scrollY + 120; // offset for sticky header
      
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = section.getAttribute("id");
        }
      });
      
      navAnchorLinks.forEach(link => {
        link.classList.remove("active");
        const href = link.getAttribute("href");
        if (href === `#${currentSectionId}` || href === `index.html#${currentSectionId}`) {
          link.classList.add("active");
        }
      });
    };

    // Run immediately on page load
    updateActiveLink();

    // Run on scroll
    window.addEventListener("scroll", updateActiveLink);
    
    // Run on full page load to catch late browser scroll jumps
    window.addEventListener("load", updateActiveLink);
  }
});
