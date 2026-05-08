const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = document.querySelectorAll('a[href^="#"]');
const revealItems = document.querySelectorAll(".reveal");
const pillarMosaic = document.querySelector("[data-pillar-mosaic]");
const pillarPanels = document.querySelectorAll("[data-pillar-panel]");
let activePillarIndex = 0;
let isPillarAnimating = false;

const setHeaderState = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};

const closeMenu = () => {
  document.body.classList.remove("menu-open");
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getPillarLayout = (activeIndex) => {
  const smallPanels = [...pillarPanels].map((_, index) => index).filter((index) => index !== activeIndex);

  return [...pillarPanels].map((_, index) => {
    if (index === activeIndex) {
      return {
        height: "100%",
        left: "0%",
        top: "0%",
        width: "66.666%",
      };
    }

    const smallIndex = smallPanels.indexOf(index);

    return {
      height: "50%",
      left: "66.666%",
      top: smallIndex === 0 ? "0%" : "50%",
      width: "33.334%",
    };
  });
};

const applyPillarLayout = (activeIndex) => {
  if (!pillarMosaic || pillarPanels.length === 0 || window.innerWidth <= 980) {
    pillarPanels.forEach((panel) => {
      panel.classList.remove("is-active");
      panel.removeAttribute("style");
    });
    return;
  }

  activePillarIndex = clamp(activeIndex, 0, pillarPanels.length - 1);
  const layout = getPillarLayout(activePillarIndex);

  pillarPanels.forEach((panel, index) => {
    panel.classList.toggle("is-active", index === activePillarIndex);
    panel.style.setProperty("--panel-top", layout[index].top);
    panel.style.setProperty("--panel-left", layout[index].left);
    panel.style.setProperty("--panel-width", layout[index].width);
    panel.style.setProperty("--panel-height", layout[index].height);
  });
};

const activatePillar = (nextIndex) => {
  if (
    !pillarMosaic ||
    window.innerWidth <= 980 ||
    nextIndex === activePillarIndex ||
    isPillarAnimating
  ) {
    return;
  }

  isPillarAnimating = true;
  pillarMosaic.classList.add("is-swapping");

  window.setTimeout(() => {
    applyPillarLayout(nextIndex);
    pillarMosaic.classList.remove("is-swapping");

    window.setTimeout(() => {
      isPillarAnimating = false;
    }, 650);
  }, 180);
};

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

pillarPanels.forEach((panel, index) => {
  panel.addEventListener("mouseenter", () => activatePillar(index));
  panel.addEventListener("focusin", () => activatePillar(index));
});

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeMenu();
  }

  applyPillarLayout(activePillarIndex);
});

setHeaderState();
applyPillarLayout(activePillarIndex);
