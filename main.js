const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Header + mobile nav ---------- */
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = document.querySelectorAll('a[href^="#"]');

const setHeaderState = () => {
  if (header) header.classList.toggle("scrolled", window.scrollY > 24);
};

const closeMenu = () => {
  document.body.classList.remove("menu-open");
  if (nav) nav.classList.remove("open");
  if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  });
});

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 980) closeMenu();
});
setHeaderState();

/* ---------- Reveal on scroll ---------- */
const revealItems = document.querySelectorAll(".reveal");
if (prefersReduced) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

/* ---------- Hero word rotator ---------- */
const rotator = document.querySelector("[data-rotator]");
if (rotator && !prefersReduced) {
  const words = [...rotator.querySelectorAll(".rotator-word")];
  let idx = 0;
  window.setInterval(() => {
    const current = words[idx];
    idx = (idx + 1) % words.length;
    const next = words[idx];
    current.classList.remove("is-active");
    current.classList.add("is-out");
    next.classList.remove("is-out");
    next.classList.add("is-active");
    rotator.setAttribute("aria-label", next.textContent);
    window.setTimeout(() => current.classList.remove("is-out"), 760);
  }, 2400);
}

/* ---------- Signature cuts auto-rotator ---------- */
const cutsRoot = document.querySelector("[data-cuts]");
if (cutsRoot) {
  const tabs = [...cutsRoot.querySelectorAll(".cut-tab")];
  const imgs = [...cutsRoot.querySelectorAll(".cuts-img")];
  const nameEl = cutsRoot.querySelector("[data-cut-name]");
  const priceEl = cutsRoot.querySelector("[data-cut-price]");
  const descEl = cutsRoot.querySelector("[data-cut-desc]");
  const metaEl = cutsRoot.querySelector("[data-cut-meta]");
  const currentEl = cutsRoot.querySelector("[data-cut-current]");
  const swapEls = [nameEl, priceEl, descEl, metaEl];

  const DURATION = 5600;
  let index = 0;
  let elapsed = 0;
  let lastTs = 0;
  let paused = false;
  let inView = true;

  const render = (i) => {
    tabs.forEach((t, k) => {
      t.classList.toggle("is-active", k === i);
      if (k !== i) t.style.setProperty("--p", 0);
    });
    imgs.forEach((im, k) => im.classList.toggle("is-active", k === i));
    const d = tabs[i].dataset;
    if (nameEl) nameEl.textContent = d.name;
    if (priceEl) priceEl.textContent = d.price;
    if (descEl) descEl.textContent = d.desc;
    if (metaEl) metaEl.textContent = d.meta;
    if (currentEl) currentEl.textContent = String(i + 1).padStart(2, "0");
    swapEls.forEach((el) => {
      if (!el) return;
      el.classList.remove("swap");
      void el.offsetWidth;
      el.classList.add("swap");
    });
  };

  const goto = (i) => {
    index = (i + tabs.length) % tabs.length;
    elapsed = 0;
    render(index);
  };

  tabs.forEach((tab, k) => {
    tab.addEventListener("click", () => goto(k));
    tab.addEventListener("focus", () => goto(k));
  });

  const pause = () => (paused = true);
  const resume = () => {
    paused = false;
    lastTs = 0;
  };
  cutsRoot.addEventListener("mouseenter", pause);
  cutsRoot.addEventListener("mouseleave", resume);
  cutsRoot.addEventListener("focusin", pause);
  cutsRoot.addEventListener("focusout", resume);

  if (!prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (inView = e.isIntersecting)),
      { threshold: 0.2 }
    );
    io.observe(cutsRoot);

    const tick = (ts) => {
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;
      if (!paused && inView) {
        elapsed += dt;
        const p = Math.min(elapsed / DURATION, 1);
        tabs[index].style.setProperty("--p", p);
        if (p >= 1) goto(index + 1);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  render(0);
}

/* ---------- Menu tabs ---------- */
const menuTabsRoot = document.querySelector("[data-menu-tabs]");
if (menuTabsRoot) {
  const tabs = [...menuTabsRoot.querySelectorAll(".menu-tab")];
  const panels = [...document.querySelectorAll(".menu-panel")];
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.menuTab;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach((p) => p.classList.toggle("is-active", p.dataset.menuPanel === key));
    });
  });
}

/* ---------- Count-up stats ---------- */
const statsRoot = document.querySelector("[data-stats]");
if (statsRoot) {
  const counters = [...statsRoot.querySelectorAll("[data-count]")];
  const runCount = () => {
    counters.forEach((el) => {
      const target = Number(el.dataset.count) || 0;
      if (prefersReduced) {
        el.textContent = String(target);
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(eased * target));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };
  const statObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCount();
          obs.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  statObserver.observe(statsRoot);
}

/* ---------- Ember particles ---------- */
const emberCanvas = document.querySelector("[data-embers]");
if (emberCanvas && !prefersReduced) {
  const ctx = emberCanvas.getContext("2d");
  let width = 0;
  let height = 0;
  let embers = [];
  let raf = null;

  const colors = ["255,138,51", "255,106,31", "233,176,75", "255,210,30"];

  const makeEmber = (initial) => {
    const size = Math.random() * 2.4 + 0.6;
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 10,
      size,
      speed: Math.random() * 0.5 + 0.18,
      drift: (Math.random() - 0.5) * 0.4,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
      alpha: Math.random() * 0.5 + 0.25,
      color: colors[(Math.random() * colors.length) | 0],
    };
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    emberCanvas.width = width * dpr;
    emberCanvas.height = height * dpr;
    emberCanvas.style.width = width + "px";
    emberCanvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(width, 1600) / 22);
    embers = Array.from({ length: count }, () => makeEmber(true));
  };

  const frame = () => {
    ctx.clearRect(0, 0, width, height);
    embers.forEach((e, i) => {
      e.wobble += e.wobbleSpeed;
      e.y -= e.speed;
      e.x += e.drift + Math.sin(e.wobble) * 0.3;
      const flick = 0.7 + Math.sin(e.wobble * 3) * 0.3;
      if (e.y < -12) embers[i] = makeEmber(false);
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${e.color},${e.alpha * flick})`;
      ctx.shadowBlur = e.size * 4;
      ctx.shadowColor = `rgba(${e.color},0.8)`;
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  };

  resize();
  start();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
}
