/* =========================
   SMOOTH MOMENTUM SCROLL
   Desktop only - keeps mobile/touch scrolling native
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;

  if (prefersReducedMotion || isTouchDevice) return;

  document.documentElement.classList.add("smooth-scroll-enabled");

  let currentY = window.scrollY || window.pageYOffset;
  let targetY = currentY;
  let rafId = null;
  let isAnimating = false;


const ease = 0.03;
const wheelStrength = 1.1;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getMaxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function normaliseWheelDelta(event) {
    if (event.deltaMode === 1) return event.deltaY * 16;
    if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
    return event.deltaY;
  }

  function hasScrollableParent(element) {
    let node = element;

    while (node && node !== document.body && node !== document.documentElement) {
      const style = window.getComputedStyle(node);
      const canScrollY = /(auto|scroll)/.test(style.overflowY);

      if (canScrollY && node.scrollHeight > node.clientHeight) {
        return true;
      }

      node = node.parentElement;
    }

    return false;
  }

  function updateScroll() {
    isAnimating = true;

    currentY += (targetY - currentY) * ease;

    if (Math.abs(targetY - currentY) < 0.45) {
      currentY = targetY;
    }

    window.scrollTo(0, currentY);

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.update();
    }

    if (Math.abs(targetY - currentY) > 0.45) {
      rafId = requestAnimationFrame(updateScroll);
    } else {
      rafId = null;
      isAnimating = false;
    }
  }

  function startSmoothScroll() {
    targetY = clamp(targetY, 0, getMaxScroll());

    if (!rafId) {
      rafId = requestAnimationFrame(updateScroll);
    }
  }

  window.addEventListener(
    "wheel",
    (event) => {
      if (document.body.classList.contains("intro-lock")) return;
      if (hasScrollableParent(event.target)) return;

      event.preventDefault();

      const delta = normaliseWheelDelta(event) * wheelStrength;
      targetY = clamp(targetY + delta, 0, getMaxScroll());
      startSmoothScroll();
    },
    { passive: false }
  );

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      const targetElement = hash && hash !== "#" ? document.querySelector(hash) : document.body;

      if (!targetElement) return;

      event.preventDefault();

      const top = targetElement === document.body
        ? 0
        : targetElement.getBoundingClientRect().top + window.scrollY;

      targetY = clamp(top, 0, getMaxScroll());
      startSmoothScroll();
    });
  });

  window.addEventListener(
    "scroll",
    () => {
      if (!isAnimating) {
        currentY = window.scrollY || window.pageYOffset;
        targetY = currentY;
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    currentY = window.scrollY || window.pageYOffset;
    targetY = clamp(currentY, 0, getMaxScroll());

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh(true);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const heroCard = document.getElementById("heroCard");
  const menuToggle = document.getElementById("menuToggle");
  const navShell = document.querySelector(".nav-shell");

  /* =========================
     MOBILE MENU
  ========================= */
  if (menuToggle && navShell) {
    menuToggle.addEventListener("click", () => {
      navShell.classList.toggle("active");
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navShell.classList.remove("active");
      });
    });
  }

  /* =========================
     GSAP INTRO ANIMATION
  ========================= */
  if (typeof gsap !== "undefined") {
    gsap.set(".title-line", { yPercent: 110, opacity: 0 });
    gsap.set(".hero-card", { opacity: 0 });
    gsap.set(".site-header", { y: -30, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".site-header", {
      y: 0,
      opacity: 1,
      duration: 0.9
    })
.to(".hero-card", {
  opacity: 1,
  duration: 1.2
}, "-=0.45")
    .to(".reveal-up", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.08
    }, "-=0.8")
    .to(".title-line", {
      yPercent: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.12,
      ease: "power4.out"
    }, "-=0.75")
    .from(".hero-badge", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08
    }, "-=0.6")
    .from(".hero-accent-object", {
      y: 20,
      opacity: 0,
      rotate: -8,
      duration: 1
    }, "-=0.8");
  }

  /* =========================
     HERO PARALLAX
  ========================= */
  if (heroCard) {
    const layers = heroCard.querySelectorAll(".layer");

    heroCard.addEventListener("mousemove", (e) => {
      const rect = heroCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const moveX = (x / rect.width - 0.5) * 30;
      const moveY = (y / rect.height - 0.5) * 30;

      layers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth || 0.1);

        gsap.to(layer, {
          x: moveX * depth * 2,
          y: moveY * depth * 2,
          duration: 0.8,
          ease: "power2.out"
        });
      });
    });

    heroCard.addEventListener("mouseleave", () => {
      layers.forEach((layer) => {
        gsap.to(layer, {
          x: 0,
          y: 0,
          duration: 1,
          ease: "power3.out"
        });
      });
    });
  }

  /* =========================
     MAGNETIC BUTTONS
  ========================= */
  const magneticButtons = document.querySelectorAll(".magnetic");

  magneticButtons.forEach((button) => {
    button.addEventListener("mousemove", (e) => {
      const rect = button.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: relX * 0.18,
        y: relY * 0.18,
        duration: 0.35,
        ease: "power2.out"
      });
    });

    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.45,
        ease: "power3.out"
      });
    });
  });
});
/* =========================
   ABOUT US STICKY TEXT REVEAL
========================= */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const aboutSection = document.querySelector(".about-section");
  const aboutText = document.querySelector("[data-about-reveal]");
  const aboutMask = document.querySelector(".about-text-mask");
  const tags = document.querySelectorAll(".about-tag");

  if (!aboutSection || !aboutText || !aboutMask) return;

  if (!aboutText.dataset.processed) {
    const text = aboutText.textContent.trim().replace(/\s+/g, " ");
    const words = text.split(" ");

    aboutText.innerHTML = words
      .map((word) => {
        const chars = word
          .split("")
          .map((char) => `<span class="about-char">${char}</span>`)
          .join("");

        return `<span class="about-word">${chars}</span>`;
      })
      .join("");

    aboutText.dataset.processed = "true";
  }

  const chars = Array.from(aboutText.querySelectorAll(".about-char"));
  let previousActive = -1;

  function updateActiveChars(activeCount) {
    if (activeCount === previousActive) return;

    if (activeCount > previousActive) {
      for (let i = previousActive + 1; i <= activeCount; i++) {
        if (chars[i]) chars[i].classList.add("is-active");
      }
    } else {
      for (let i = previousActive; i > activeCount; i--) {
        if (chars[i]) chars[i].classList.remove("is-active");
      }
    }

    previousActive = activeCount;
  }

  function getDistance(extraMove) {
    const textHeight = aboutText.scrollHeight;
    const maskHeight = aboutMask.clientHeight;
    return Math.max(0, textHeight - maskHeight + extraMove);
  }

  const mm = gsap.matchMedia();

  function createAboutScroll(config) {
    const trigger = ScrollTrigger.create({
      trigger: aboutSection,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;

        const distance = getDistance(config.extraMove);
        gsap.set(aboutText, {
          y: -distance * progress
        });

        const revealProgress = Math.min(progress * config.revealSpeed, 1);
        const activeCount = Math.floor(revealProgress * (chars.length - 1));

        updateActiveChars(activeCount);
      },
      onLeaveBack: () => {
        gsap.set(aboutText, { y: 0 });
        updateActiveChars(-1);
      }
    });

    return () => {
      trigger.kill();
    };
  }

  mm.add("(min-width: 761px)", () => {
    return createAboutScroll({
      revealSpeed: 1.35,
      extraMove: 24
    });
  });

  mm.add("(max-width: 760px)", () => {
    return createAboutScroll({
      revealSpeed: 1.2,
      extraMove: 34
    });
  });

  gsap.from(".about-image", {
    y: 22,
    opacity: 0,
    scale: 0.96,
    duration: 0.9,
    ease: "power3.out",
    scrollTrigger: {
      trigger: aboutSection,
      start: "top 72%"
    }
  });

  tags.forEach((tag, index) => {
    gsap.to(tag, {
      x: index % 2 === 0 ? 32 : -32,
      y: index % 2 === 0 ? -22 : 22,
      rotate: index % 2 === 0 ? 2 : -2,
      ease: "none",
      scrollTrigger: {
        trigger: aboutSection,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true
      }
    });
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
});
/* =========================
   SERVICES CARD SWAP
========================= */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const track = document.querySelector(".services-scroll-track");
  const cards = gsap.utils.toArray("[data-service-card]");
  const currentCounter = document.querySelector(".services-current");
  const vectors = gsap.utils.toArray([
    ".services-vector-left",
    ".services-vector-right"
  ]);

  if (!track || !cards.length || !currentCounter) return;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function getCardMetrics() {
  const isMobile = window.matchMedia("(max-width: 760px)").matches;

  return {
    spreadX: isMobile ? 155 : 340,
    maxX: isMobile ? 210 : 440,
    spreadY: isMobile ? 5 : 12,
    rotate: isMobile ? 6 : 11,
    scaleLoss: isMobile ? 0.12 : 0.13,

    /* soft center lock */
    lockZone: isMobile ? 0.34 : 0.26,
    lockStrength: isMobile ? 0.82 : 0.78
  };
}

function applyCenterLock(rawProgress) {
  const metrics = getCardMetrics();
  const nearestCard = Math.round(rawProgress);
  const distanceToCenter = Math.abs(rawProgress - nearestCard);

  if (distanceToCenter >= metrics.lockZone) {
    return rawProgress;
  }

  const t = 1 - distanceToCenter / metrics.lockZone;
  const smoothStrength = t * t * (3 - 2 * t);
  const magneticStrength = metrics.lockStrength;

  return rawProgress + (nearestCard - rawProgress) * smoothStrength * magneticStrength;
}

  function renderCards(rawProgress) {
    const metrics = getCardMetrics();
    const lockedProgress = applyCenterLock(rawProgress);

    cards.forEach((card, index) => {
      const relative = index - lockedProgress;
      const abs = Math.abs(relative);

      const x = clamp(relative * metrics.spreadX, -metrics.maxX, metrics.maxX);
      const y = abs * metrics.spreadY;
      const scale = Math.max(1 - abs * metrics.scaleLoss, 0.78);
      const rotation = relative * metrics.rotate;

      const isFocused = abs < 0.08;

      const opacity = isFocused
        ? 1
        : abs > 2
          ? 0
          : Math.max(1 - abs * 0.42, 0.18);

      const zIndex = isFocused ? 200 : 100 - Math.round(abs * 20);

      gsap.set(card, {
        x,
        y,
        scale,
        rotation,
        opacity,
        zIndex,
        filter: "none"
      });
    });

    const activeIndex = Math.min(
      cards.length - 1,
      Math.max(0, Math.round(lockedProgress))
    );

    currentCounter.textContent = String(activeIndex + 1).padStart(2, "0");
  }

  function renderFromScroll(self) {
    const rawProgress = self.progress * (cards.length - 1);
    renderCards(rawProgress);
  }

  const servicesTrigger = ScrollTrigger.create({
    trigger: track,
    start: "top top",
    end: "bottom bottom",
    scrub: 1.2,
    invalidateOnRefresh: true,

    onUpdate: renderFromScroll,
    onRefresh: renderFromScroll,

    onLeave: () => {
      renderCards(cards.length - 1);
    },

    onEnterBack: (self) => {
      renderFromScroll(self);
    },

    onLeaveBack: () => {
      renderCards(0);
    }
  });

  renderCards(0);

  gsap.set(vectors, {
    opacity: 1
  });

  vectors.forEach((vector, index) => {
    gsap.to(vector, {
      y: index === 0 ? -18 : 18,
      x: index === 0 ? 10 : -10,
      ease: "none",
      scrollTrigger: {
        trigger: track,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true
      }
    });
  });

  window.addEventListener("resize", () => {
    renderCards(servicesTrigger.progress * (cards.length - 1));
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh(true);
    renderCards(servicesTrigger.progress * (cards.length - 1));
  });
});
/* =========================
   INTRO SCREEN
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("siteIntro");
  const introContent = document.querySelector(".intro-content");

  if (!intro || !introContent) return;

  if (typeof gsap === "undefined") {
    setTimeout(() => {
      intro.style.display = "none";
      document.body.classList.remove("intro-lock");
    }, 1800);
    return;
  }

  const tl = gsap.timeline({
    defaults: {
      ease: "power3.out"
    }
  });

  tl.from(".intro-logo-wrap", {
    y: 24,
    scale: 0.86,
    opacity: 0,
    duration: 0.7
  })
  .from(".intro-title", {
    y: 18,
    opacity: 0,
    duration: 0.55
  }, "-=0.35")
  .to(introContent, {
    x: 4,
    duration: 0.045,
    repeat: 7,
    yoyo: true,
    ease: "power1.inOut"
  })
  .to(introContent, {
    x: 0,
    scale: 1.035,
    duration: 0.28,
    ease: "power2.out"
  })
  .to(intro, {
    opacity: 0,
    duration: 0.7,
    ease: "power2.inOut",
    delay: 0.2,
    onComplete: () => {
      intro.style.display = "none";
      document.body.classList.remove("intro-lock");

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh(true);
      }
    }
  });
});
/* =========================
   RATE CARDS SLIDER
========================= */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined") return;

  const rateSection = document.querySelector(".rate-section");
  const rateTitle = document.querySelector("[data-rate-title]");
  const rateTrack = document.querySelector("[data-rate-track]");
  const ratePanels = Array.from(document.querySelectorAll("[data-rate-panel]"));
  const rateButtons = Array.from(document.querySelectorAll("[data-rate-dir]"));

  if (!rateSection || !rateTitle || !rateTrack || !ratePanels.length || !rateButtons.length) return;

  let currentRateIndex = 0;
  let isRateAnimating = false;

  function updateRateTitle(index) {
    rateTitle.textContent = ratePanels[index].dataset.category || "Rate Cards";
  }

  function moveRateTrack(index, instant = false) {
    gsap.to(rateTrack, {
      xPercent: -100 * index,
      duration: instant ? 0 : 0.85,
      ease: "power3.inOut"
    });
  }

  function animateActiveCards(index) {
    const cards = ratePanels[index].querySelectorAll(".rate-card");

    gsap.fromTo(
      cards,
      {
        y: 34,
        opacity: 0.45,
        rotate: 2
      },
      {
        y: 0,
        opacity: 1,
        rotate: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: "power3.out"
      }
    );
  }

  function goToRatePanel(direction) {
    if (isRateAnimating) return;

    const nextIndex =
      direction === "next"
        ? (currentRateIndex + 1) % ratePanels.length
        : (currentRateIndex - 1 + ratePanels.length) % ratePanels.length;

    isRateAnimating = true;
    currentRateIndex = nextIndex;

    updateRateTitle(currentRateIndex);
    moveRateTrack(currentRateIndex);
    animateActiveCards(currentRateIndex);

    setTimeout(() => {
      isRateAnimating = false;
    }, 900);
  }

  rateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      goToRatePanel(button.dataset.rateDir);
    });
  });

  updateRateTitle(0);
  gsap.set(rateTrack, { xPercent: 0 });

  if (typeof ScrollTrigger !== "undefined") {
    gsap.from(".rate-header", {
      y: 34,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: rateSection,
        start: "top 78%",
        toggleActions: "play none none reverse"
      }
    });

    gsap.from(".rate-panel:first-child .rate-card", {
      y: 44,
      opacity: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: rateSection,
        start: "top 72%",
        toggleActions: "play none none reverse"
      }
    });
  }

  window.addEventListener("resize", () => {
    gsap.set(rateTrack, {
      xPercent: -100 * currentRateIndex
    });

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh(true);
    }
  });
});
/* =========================
   PROCESS SCROLL DECK - FIXED STABLE VERSION
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".process-scroll-track");
  const slides = document.querySelector(".process-slides");
  const steps = Array.from(document.querySelectorAll(".process-step"));
  const current = document.querySelector("[data-process-current]");
  const progressBar = document.querySelector("[data-process-progress]");

  if (!track || !slides || !steps.length || !current || !progressBar) return;

  const totalSteps = steps.length;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  let targetX = 0;
  let currentX = 0;
  let targetProgress = 0;
  let animationStarted = false;
  let resizeTimer;

  function getProgress() {
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;

    const trackRect = track.getBoundingClientRect();
    const trackTop = trackRect.top + scrollY;
    const trackHeight = track.offsetHeight;

    const isMobile = window.matchMedia("(max-width: 760px)").matches;

    /*
      This delays the animation start.
      So on mobile, the blue process card can enter first
      before it starts sliding to card 02.
    */
    const startOffset = isMobile ? viewportHeight * 0.62 : viewportHeight * 0.28;

    const start = trackTop + startOffset;
    const end = trackTop + trackHeight - viewportHeight;

    const distance = Math.max(end - start, 1);

    return clamp((scrollY - start) / distance, 0, 1);
  }

  function updateUI(progress) {
    const activeIndex = clamp(
      Math.round(progress * (totalSteps - 1)),
      0,
      totalSteps - 1
    );

    current.textContent = String(activeIndex + 1).padStart(2, "0");
    progressBar.style.width = `${progress * 100}%`;
  }

  function updateProcess() {
    targetProgress = getProgress();
    targetX = -targetProgress * (totalSteps - 1) * 100;

    updateUI(targetProgress);
  }

  function forceSyncProcess() {
    targetProgress = getProgress();
    targetX = -targetProgress * (totalSteps - 1) * 100;
    currentX = targetX;

    slides.style.transform = `translate3d(${currentX}%, 0, 0)`;
    updateUI(targetProgress);
  }

  function renderProcess() {
    currentX += (targetX - currentX) * 0.16;

    if (Math.abs(targetX - currentX) < 0.01) {
      currentX = targetX;
    }

    slides.style.transform = `translate3d(${currentX}%, 0, 0)`;

    requestAnimationFrame(renderProcess);
  }

  window.addEventListener("scroll", updateProcess, { passive: true });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      forceSyncProcess();
    }, 150);
  });

  window.addEventListener("load", () => {
    setTimeout(() => {
      forceSyncProcess();
    }, 120);
  });

  window.addEventListener("pageshow", () => {
    setTimeout(() => {
      forceSyncProcess();
    }, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      setTimeout(() => {
        forceSyncProcess();
      }, 120);
    }
  });

  forceSyncProcess();
  updateProcess();

  if (!animationStarted) {
    animationStarted = true;
    requestAnimationFrame(renderProcess);
  }
});
/* =========================
   FAQ ACCORDION
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = Array.from(document.querySelectorAll(".faq-item"));

  if (!faqItems.length) return;

  function isMobileFAQ() {
    return window.matchMedia("(hover: none), (pointer: coarse), (max-width: 760px)").matches;
  }

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");

    if (!button) return;

    button.addEventListener("click", () => {
      if (!isMobileFAQ()) return;

      const isOpen = item.classList.contains("is-open");

      faqItems.forEach((faq) => {
        faq.classList.remove("is-open");
      });

      if (!isOpen) {
        item.classList.add("is-open");
      }
    });
  });

  window.addEventListener("resize", () => {
    if (!isMobileFAQ()) {
      faqItems.forEach((item) => {
        item.classList.remove("is-open");
      });
    }
  });
});
/* =========================
   CONTACT + FOOTER
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const footerYear = document.querySelector("[data-footer-year]");
  const contactForm = document.querySelector("#contactForm");

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);

      const firstName = String(formData.get("firstName") || "").trim();
      const lastName = String(formData.get("lastName") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const service = String(formData.get("service") || "").trim();
      const message = String(formData.get("message") || "").trim();

      const fullName = `${firstName} ${lastName}`.trim();

      const plainMessage =
`Hi Only Good Lab,

I would like to enquire about: ${service}

Name: ${fullName}
Email: ${email}

Project Details:
${message}`;

      const whatsappText = encodeURIComponent(plainMessage);
      const emailSubject = encodeURIComponent(`New inquiry from ${fullName || "Website Visitor"}`);
      const emailBody = encodeURIComponent(plainMessage);

      const whatsappUrl = `https://wa.me/601115456770?text=${whatsappText}`;
      const mailtoUrl = `mailto:hello@onlygoodlab.com?subject=${emailSubject}&body=${emailBody}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 350);
    });
  }

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.from(".contact-form-panel", {
      y: 34,
      opacity: 0,
      scale: 0.99,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".contact-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });

    gsap.from(".contact-detail-card", {
      y: 24,
      opacity: 0,
      duration: 0.7,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".contact-cards",
        start: "top 84%",
        toggleActions: "play none none reverse"
      }
    });

    gsap.from(".site-footer", {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".site-footer",
        start: "top 88%",
        toggleActions: "play none none reverse"
      }
    });
  }
});

/* =========================
   HERO AUTO LOOP SLIDER
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));

  if (!slides.length) return;

  let currentHeroSlide = 0;
  let heroTimer = null;
  const delay = 5600;

  function setActiveHeroSlide(index) {
    if (index === currentHeroSlide) return;

    const previous = currentHeroSlide;
    currentHeroSlide = index;

    slides[previous]?.classList.remove("is-active");
    slides[currentHeroSlide]?.classList.add("is-active");

    dots[previous]?.classList.remove("is-active");
    dots[currentHeroSlide]?.classList.add("is-active");

    if (typeof gsap !== "undefined") {
      const activeSlide = slides[currentHeroSlide];
      const animatedItems = activeSlide.querySelectorAll(".hero-eyebrow, .title-line, .hero-slide-copy, .hero-statement, .hero-actions");

      gsap.fromTo(
        animatedItems,
        { y: 26, opacity: 0, filter: "blur(8px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.05,
          stagger: 0.08,
          ease: "power4.out"
        }
      );
    }
  }

  function nextHeroSlide() {
    setActiveHeroSlide((currentHeroSlide + 1) % slides.length);
  }

  function startHeroSlider() {
    clearInterval(heroTimer);
    heroTimer = setInterval(nextHeroSlide, delay);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      setActiveHeroSlide(index);
      startHeroSlider();
    });
  });

  startHeroSlider();
});
