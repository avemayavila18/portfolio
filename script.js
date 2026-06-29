/**
 * Ave Portfolio — script.js
 * Handles: loader, cursor, nav, scroll reveal,
 *          hero reveal, skills orbit canvas,
 *          magnetic elements,
 *          contact form, parallax, smooth scroll.
 */

'use strict';

/* ============================================================
   UTILITIES
   ============================================================ */

/**
 * Safely query an element; returns null if not found.
 */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Map a value from one range to another.
 */
const mapRange = (val, inMin, inMax, outMin, outMax) =>
  ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;

/* ============================================================
   LOADER
   ============================================================ */
const initLoader = () => {
  const loader = qs('#loader');
  if (!loader) return;

  // Let the CSS animation run (~1.8 s) then hide
  setTimeout(() => {
    loader.classList.add('is-done');
    document.body.style.overflow = '';
    initHeroReveal(); // trigger hero text after loader
  }, 1850);

  document.body.style.overflow = 'hidden';
};

/* ============================================================
   CURSOR
   ============================================================ */
const initCursor = () => {
  const cursor   = qs('#cursor');
  const follower = qs('#cursorFollower');
  if (!cursor || !follower) return;
  if (window.matchMedia('(pointer: coarse)').matches) {
    // Touch device — hide custom cursor
    cursor.style.display = 'none';
    follower.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let raf;

  const onMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };
  document.addEventListener('mousemove', onMouseMove, { passive: true });

  const animateCursor = () => {
    // Cursor snaps
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';

    // Follower lerps
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';

    raf = requestAnimationFrame(animateCursor);
  };
  raf = requestAnimationFrame(animateCursor);

  // Hover states for interactive elements
  const hoverEls = 'a, button, .service__item, .timeline__item, .project__image-wrap, input, textarea, select, .process__step';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-hovering');
      follower.classList.add('is-hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-hovering');
      follower.classList.remove('is-hovering');
    });
  });
};

/* ============================================================
   NAV — scroll state + mobile menu
   ============================================================ */
const initNav = () => {
  const nav       = qs('.nav');
  const menuBtn   = qs('#menuBtn');
  const navOverlay = qs('#navOverlay');

  if (!nav) return;

  // Scroll state
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  if (menuBtn && navOverlay) {
    const overlayLinks = qsa('.overlay-link', navOverlay);

    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.classList.toggle('is-open');
      navOverlay.classList.toggle('is-open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      navOverlay.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    overlayLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('is-open');
        navOverlay.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        navOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }
};

/* ============================================================
   HERO TEXT REVEAL (triggered after loader)
   ============================================================ */
const initHeroReveal = () => {
  const reveals = qsa('.reveal-text');
  reveals.forEach(el => {
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('is-visible'), delay);
  });
};

/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
const initScrollReveal = () => {
  const elements = qsa('.fade-in');
  if (!elements.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => io.observe(el));
};

/* ============================================================
   STAGGERED CHILDREN — timeline items, service items, etc.
   ============================================================ */
const initStaggered = () => {
  const groups = [
    { parent: '.timeline', children: '.timeline__item' },
    { parent: '.process__steps', children: '.process__step' },
    { parent: '.services__list', children: '.service__item' },
  ];

  groups.forEach(({ parent, children }) => {
    const parentEl = qs(parent);
    if (!parentEl) return;
    qsa(children, parentEl).forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });
};

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
const initCounters = () => {
  const counters = qsa('[data-count]');
  if (!counters.length) return;

  const easePow = (t) => 1 - Math.pow(1 - t, 3); // ease-out cubic

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      el.textContent = Math.round(easePow(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
};

/* ============================================================
   SKILLS ORBIT CANVAS
   ============================================================ */
const initSkillsCanvas = () => {
  const canvas = qs('#skillsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const skills = [
    // [label, orbit-ring (0=center,1,2,3), speed-multiplier]
    { label: 'WordPress',         ring: 2, speed: 0.5 },
    { label: 'Web Design',        ring: 1, speed: -0.7 },
    { label: 'HTML / CSS',        ring: 2, speed: 0.6 },
    { label: 'Mailchimp',         ring: 3, speed: 0.4 },
    { label: 'Email Marketing',   ring: 1, speed: 0.8 },
    { label: 'HTML Email',        ring: 3, speed: -0.35 },
    { label: 'Zapier',            ring: 2, speed: -0.55 },
    { label: 'Make',              ring: 1, speed: -0.9 },
    { label: 'Airtable',          ring: 3, speed: 0.45 },
    { label: 'Canva',             ring: 2, speed: 0.65 },
    { label: 'Brand Identity',    ring: 1, speed: 0.75 },
    { label: 'Figma',             ring: 3, speed: -0.5 },
    { label: 'SOPs',              ring: 2, speed: -0.4 },
    { label: 'Notion',            ring: 1, speed: 0.6 },
    { label: 'Lead Generation',   ring: 3, speed: 0.55 },
  ];

  // Assign angle offset so items on the same ring spread out
  const ringCounts = {};
  skills.forEach(s => { ringCounts[s.ring] = (ringCounts[s.ring] || 0) + 1; });
  const ringIdx = {};
  skills.forEach(s => {
    ringIdx[s.ring] = (ringIdx[s.ring] || 0);
    s.angle = (ringIdx[s.ring] / ringCounts[s.ring]) * Math.PI * 2;
    ringIdx[s.ring]++;
  });

  // Colors from CSS vars (hardcoded to match)
  const COLOR_RING  = '#E3E1DB';
  const COLOR_TEXT  = '#0A0A0A';
  const COLOR_MUTED = '#888884';
  const COLOR_ACCENT= '#C8B89A';
  const COLOR_BG    = '#F7F6F2';

  let w, h, cx, cy;
  const radii = [0, 110, 200, 290];

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    cx = w / 2;
    cy = h / 2;
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  let t = 0;
  let raf;
  let isVisible = false;

  const io = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible) raf = requestAnimationFrame(draw);
    else cancelAnimationFrame(raf);
  }, { threshold: 0.1 });
  io.observe(canvas);

  const draw = () => {
    if (!isVisible) return;
    t += 0.003;

    ctx.clearRect(0, 0, w, h);

    // Draw orbit rings
    [1, 2, 3].forEach(i => {
      ctx.beginPath();
      ctx.arc(cx, cy, radii[i], 0, Math.PI * 2);
      ctx.strokeStyle = COLOR_RING;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_ACCENT;
    ctx.fill();

    // Center label
    ctx.font = `300 13px 'Inter', sans-serif`;
    ctx.fillStyle = COLOR_MUTED;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Ave.', cx, cy + 22);

    // Skill nodes
    skills.forEach(skill => {
      const r   = radii[skill.ring];
      const ang = skill.angle + t * skill.speed;
      const x   = cx + Math.cos(ang) * r;
      const y   = cy + Math.sin(ang) * r;

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = skill.ring === 1 ? COLOR_TEXT : COLOR_ACCENT;
      ctx.fill();

      // Label pill
      ctx.font = `400 11px 'Inter', sans-serif`;
      const textW = ctx.measureText(skill.label).width;
      const padX  = 8;
      const padY  = 4;
      const pillW = textW + padX * 2;
      const pillH = 20;

      // Position label outside node
      const offsetDir = Math.cos(ang) >= 0 ? 1 : -1;
      const lx = x + offsetDir * (pillW / 2 + 10);
      const ly = y;

      ctx.fillStyle = COLOR_BG;
      ctx.beginPath();
      ctx.roundRect(lx - pillW / 2, ly - pillH / 2, pillW, pillH, 10);
      ctx.fill();

      ctx.strokeStyle = COLOR_RING;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = COLOR_MUTED;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(skill.label, lx, ly);
    });

    raf = requestAnimationFrame(draw);
  };
};

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
const initMagnetic = () => {
  const magnetics = qsa('.magnetic');
  if (!magnetics.length) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  magnetics.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect   = el.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = e.clientX - cx;
      const dy     = e.clientY - cy;
      const strength = 0.3;
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
};

/* ============================================================
   CONTACT FORM
   ============================================================ */
const initContactForm = () => {
  const form = qs('.contact__form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;

    btn.textContent = 'Sending…';
    btn.disabled = true;

    // Simulate async send (replace with actual fetch/formspree/etc.)
    setTimeout(() => {
      btn.textContent = 'Message Sent ✓';
      btn.style.background = '#C8B89A';
      btn.style.borderColor = '#C8B89A';
      btn.style.color = '#0A0A0A';

      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
        btn.style = '';
        form.reset();
      }, 4000);
    }, 1500);
  });
};

/* ============================================================
   PARALLAX — subtle section headings
   ============================================================ */
const initParallax = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const shapes = qsa('.ambient-shape');
  const onScroll = () => {
    const scrollY = window.scrollY;
    shapes.forEach((el, i) => {
      const speed = (i + 1) * 0.08;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
};

/* ============================================================
   FOOTER YEAR
   ============================================================ */
const initFooterYear = () => {
  const el = qs('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
};

/* ============================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */
const initSmoothScroll = () => {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = qs(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
};

/* ============================================================
   MARQUEE — pause on hover
   ============================================================ */
const initMarquee = () => {
  const track = qs('.marquee__track');
  if (!track) return;
  track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
  track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
};

/* ============================================================
   INIT — run everything after DOM ready
   ============================================================ */
const init = () => {
  initLoader();
  initCursor();
  initNav();
  initScrollReveal();
  initStaggered();
  initSkillsCanvas();
  initMagnetic();
  initContactForm();
  initParallax();
  initFooterYear();
  initSmoothScroll();
  initMarquee();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
