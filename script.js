/* ═══════════════════════════════════════════════
   YOUSEF ELDIB — PORTFOLIO SCRIPTS
   script.js
═══════════════════════════════════════════════ */

"use strict";

/* ══════════════════════════════════════════════
   1. CUSTOM CURSOR
══════════════════════════════════════════════ */
(function initCursor() {
  const cursor = document.createElement("div");
  const ring   = document.createElement("div");
  cursor.className = "cursor";
  ring.className   = "cursor-ring";
  document.body.appendChild(cursor);
  document.body.appendChild(ring);

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  (function animCursor() {
    cursor.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(animCursor);
  })();

  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.style.transform += " scale(1.6)";
      ring.style.opacity = "1";
      ring.style.transform += " scale(1.4)";
    });
    el.addEventListener("mouseleave", () => {
      ring.style.opacity = "0.5";
    });
  });
})();


/* ══════════════════════════════════════════════
   2. ANIMATED CANVAS BACKGROUND
   Particle network with flowing lines and
   glowing nodes — dark tech aesthetic
══════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  /* ── Resize ─────────────────────────────── */
  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", () => { resize(); buildParticles(); });

  /* ── Config ─────────────────────────────── */
  const CONFIG = {
    particleCount: 90,
    maxDist: 160,
    speed: 0.35,
    nodeRadius: 2.2,
    accentColor: [29, 158, 117],   // --accent RGB
    dimColor:    [255, 255, 255],  // white for faint lines
  };

  /* ── Mouse influence ────────────────────── */
  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  /* ── Particle class ─────────────────────── */
  class Particle {
    constructor() { this.reset(true); }

    reset(random) {
      this.x  = random ? Math.random() * canvas.width  : (Math.random() < 0.5 ? 0 : canvas.width);
      this.y  = random ? Math.random() * canvas.height : (Math.random() < 0.5 ? 0 : canvas.height);
      this.vx = (Math.random() - 0.5) * CONFIG.speed * 2;
      this.vy = (Math.random() - 0.5) * CONFIG.speed * 2;
      this.r  = Math.random() * CONFIG.nodeRadius + 1;
      // accent or dim
      this.isAccent = Math.random() < 0.2;
      this.alpha = Math.random() * 0.5 + 0.3;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(t) {
      /* slight mouse attraction */
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 280) {
        this.vx += (dx / dist) * 0.012;
        this.vy += (dy / dist) * 0.012;
      }

      /* velocity damping */
      this.vx *= 0.995;
      this.vy *= 0.995;

      this.x += this.vx;
      this.y += this.vy;

      /* wrap around edges */
      if (this.x < -20)               this.x = canvas.width  + 10;
      if (this.x > canvas.width  + 20) this.x = -10;
      if (this.y < -20)               this.y = canvas.height + 10;
      if (this.y > canvas.height + 20) this.y = -10;

      /* pulse */
      this.currentAlpha = this.alpha + Math.sin(t * 0.002 + this.pulseOffset) * 0.15;
    }

    draw() {
      const [r, g, b] = this.isAccent ? CONFIG.accentColor : CONFIG.dimColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${this.currentAlpha})`;
      ctx.fill();

      /* glow for accent nodes */
      if (this.isAccent) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3);
        grd.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
        ctx.fill();
      }
    }
  }

  /* ── Build particles ────────────────────── */
  let particles = [];
  function buildParticles() {
    particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
  }
  buildParticles();

  /* ── Draw connections ───────────────────── */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > CONFIG.maxDist) continue;

        const ratio = 1 - dist / CONFIG.maxDist;
        const useAccent = a.isAccent || b.isAccent;
        const [r, g, bl] = useAccent ? CONFIG.accentColor : CONFIG.dimColor;
        const alpha = ratio * (useAccent ? 0.35 : 0.06);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
        ctx.lineWidth = useAccent ? ratio * 1.2 : ratio * 0.5;
        ctx.stroke();
      }
    }
  }

  /* ── Flowing grid lines ─────────────────── */
  function drawGrid(t) {
    const spacing = 80;
    const offset  = (t * 0.015) % spacing;

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.02)";
    ctx.lineWidth   = 0.5;

    for (let x = -spacing + offset; x < canvas.width + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = -spacing + offset; y < canvas.height + spacing; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ── Spotlight following mouse ──────────── */
  function drawSpotlight() {
    const grd = ctx.createRadialGradient(
      mouse.x, mouse.y, 0,
      mouse.x, mouse.y, 350
    );
    grd.addColorStop(0, "rgba(29,158,117,0.07)");
    grd.addColorStop(1, "rgba(29,158,117,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /* ── Animation loop ─────────────────────── */
  let t = 0;
  function animate() {
    t++;

    /* dark background */
    ctx.fillStyle = "rgba(10,10,9,0.18)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(t);
    drawSpotlight();
    drawConnections();
    particles.forEach((p) => { p.update(t); p.draw(); });

    requestAnimationFrame(animate);
  }

  /* First clear */
  ctx.fillStyle = "#0a0a09";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  animate();
})();


/* ══════════════════════════════════════════════
   3. SCROLL REVEAL
══════════════════════════════════════════════ */
(function initReveal() {
  const items = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          /* stagger siblings */
          const siblings = entry.target.parentElement.querySelectorAll(".reveal");
          let delay = 0;
          siblings.forEach((sib, idx) => {
            if (sib === entry.target) delay = idx * 80;
          });
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => observer.observe(el));
})();


/* ══════════════════════════════════════════════
   4. SMOOTH ACTIVE NAV LINKS
══════════════════════════════════════════════ */
(function initNav() {
  const sections = document.querySelectorAll(".section");
  const links    = document.querySelectorAll(".nav-links a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((a) => {
            a.style.color = a.getAttribute("href") === `#${id}`
              ? "var(--accent-2)"
              : "";
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => observer.observe(s));
})();


/* ══════════════════════════════════════════════
   5. TYPING EFFECT — role line
══════════════════════════════════════════════ */
(function initTyping() {
  const el = document.querySelector(".eyebrow-text");
  if (!el) return;

  const roles = [
    "Odoo Developer & ERP Specialist",
    "Python & PostgreSQL Engineer",
    "Business Technology Student",
  ];

  let ri = 0, ci = 0, deleting = false;

  function type() {
    const current = roles[ri];
    if (!deleting) {
      el.textContent = current.slice(0, ++ci);
      if (ci === current.length) {
        deleting = true;
        setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = current.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
      }
    }
    setTimeout(type, deleting ? 40 : 65);
  }

  setTimeout(type, 1500);
})();
