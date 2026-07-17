(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.querySelector("[data-nav]");
  const menu = document.querySelector("[data-menu]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const progress = document.querySelector("[data-progress] span");
  const hero = document.querySelector(".hero");
  const reveals = document.querySelectorAll(".reveal");
  const parallaxItems = document.querySelectorAll("[data-parallax]");

  const onScrollChrome = () => {
    if (!nav) return;
    const pastHero = hero ? window.scrollY > hero.offsetHeight - 80 : window.scrollY > 24;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
    nav.classList.toggle("is-solid", pastHero);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progress.style.width = `${pct}%`;
    }
  };

  window.addEventListener("scroll", onScrollChrome, { passive: true });
  onScrollChrome();

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      menu.hidden = !open;
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav?.classList.toggle("is-solid", open || window.scrollY > 24);
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
        menu.hidden = true;
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  const masks = document.querySelectorAll(".mask");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    reveals.forEach((el) => revealObserver.observe(el));

    const maskObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            maskObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    masks.forEach((el) => maskObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
    masks.forEach((el) => el.classList.add("is-revealed"));
  }

  // Soft parallax on generated imagery
  if (!reduceMotion && parallaxItems.length) {
    let ticking = false;

    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxItems.forEach((img) => {
        const wrap = img.closest("[data-parallax-wrap]") || img.parentElement;
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        const progressY = (vh / 2 - (rect.top + rect.height / 2)) / vh;
        const shift = Math.max(-18, Math.min(18, progressY * 28));
        img.style.transform = `translate3d(0, ${shift}%, 0) scale(1.08)`;
      });
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateParallax();
  }

  // Sticky anatomy: scroll-scrubbed image story on desktop, dots on all
  const anatomy = document.querySelector("[data-anatomy]");
  if (anatomy) {
    const panels = [...anatomy.querySelectorAll("[data-anatomy-panel]")];
    const slides = [...anatomy.querySelectorAll("[data-anatomy-slide]")];
    const dots = [...anatomy.querySelectorAll("[data-anatomy-dot]")];
    let active = 0;

    const setActive = (index) => {
      if (index === active || index < 0 || index >= panels.length) return;
      active = index;
      panels.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => setActive(i));
    });

    if (!reduceMotion) {
      const onAnatomyScroll = () => {
        if (window.innerWidth < 900) return;
        const rect = anatomy.getBoundingClientRect();
        const total = anatomy.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const step = Math.min(panels.length - 1, Math.floor((scrolled / total) * panels.length));
        setActive(step);
      };

      window.addEventListener("scroll", onAnatomyScroll, { passive: true });
      window.addEventListener("resize", onAnatomyScroll, { passive: true });
      onAnatomyScroll();
    }

    // Auto-advance on mobile when section is in view
    if (window.innerWidth < 900 && !reduceMotion) {
      let timer = null;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            timer = window.setInterval(() => {
              setActive((active + 1) % panels.length);
            }, 3200);
          } else if (timer) {
            window.clearInterval(timer);
            timer = null;
          }
        },
        { threshold: 0.45 }
      );
      io.observe(anatomy);
    }
  }

  // Magnetic buttons — subtle Framer-style pull
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (event) => {
        const rect = btn.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22 - 3}px)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
  }

  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    const submitBtn = contactForm.querySelector("[data-contact-submit]");
    const statusEl = contactForm.querySelector("[data-contact-status]");

    const setStatus = (message, isError = false) => {
      if (!statusEl) return;
      statusEl.hidden = !message;
      statusEl.textContent = message;
      statusEl.classList.toggle("is-error", isError);
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (contactForm.classList.contains("is-loading")) return;

      const endpoint = contactForm.getAttribute("action");
      if (!endpoint || endpoint.includes("REPLACE")) {
        setStatus("Form endpoint not configured yet.", true);
        return;
      }

      contactForm.classList.add("is-loading");
      if (submitBtn) submitBtn.textContent = "Sending…";
      setStatus("");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("submit failed");

        contactForm.classList.add("is-success");
        contactForm.reset();
        if (submitBtn) submitBtn.textContent = "Sent";
        setStatus("Thanks — we’ll be in touch.");
      } catch {
        contactForm.classList.remove("is-loading");
        if (submitBtn) submitBtn.textContent = "Send message";
        setStatus("Something went wrong. Try again or email hello@agronomicgrower.com.", true);
      }
    });
  }
})();
