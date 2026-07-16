(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const phases = [
    {
      id: "cool",
      badge: "COOL",
      label: "Direct-to-root cooling",
      cycle: "COOLING",
      bio: "STANDBY",
      water: "IDLE",
      power: "SOLAR",
      root: [63.4, 65.1],
      rh: [68, 72],
      comp: [55, 72],
    },
    {
      id: "heat",
      badge: "HEAT",
      label: "Water tank heating",
      cycle: "HEATING",
      bio: "STANDBY",
      water: "HEATING",
      power: "SOLAR",
      root: [64.0, 65.2],
      rh: [69, 73],
      comp: [22, 34],
    },
    {
      id: "mist",
      badge: "MIST",
      label: "Overhead misting",
      cycle: "MISTING",
      bio: "STANDBY",
      water: "ACTIVE",
      power: "SOLAR",
      root: [64.0, 65.8],
      rh: [74, 82],
      comp: [30, 45],
    },
    {
      id: "sanitize",
      badge: "UV",
      label: "Biosecurity array",
      cycle: "SANITIZE",
      bio: "UV ACTIVE",
      water: "HOLD",
      power: "GRID",
      root: [64.2, 65.0],
      rh: [70, 74],
      comp: [18, 28],
    },
    {
      id: "recycle",
      badge: "LOOP",
      label: "Closed-loop recycle",
      cycle: "RECYCLE",
      bio: "STANDBY",
      water: "RETURN",
      power: "GENERATOR",
      root: [63.8, 64.9],
      rh: [69, 73],
      comp: [35, 48],
    },
  ];

  const els = {
    body: document.body,
    phaseLabel: document.querySelector("[data-phase-label]"),
    phaseBadge: document.querySelector("[data-phase-badge]"),
    cycle: document.querySelector("[data-cycle]"),
    bio: document.querySelector("[data-bio]"),
    water: document.querySelector("[data-water]"),
    power: document.querySelector("[data-power]"),
    root: document.querySelector("[data-root-temp]"),
    rh: document.querySelector("[data-rh]"),
    comp: document.querySelector("[data-comp]"),
    rootMeter: document.querySelector("[data-root-meter]"),
    rhMeter: document.querySelector("[data-rh-meter]"),
    compMeter: document.querySelector("[data-comp-meter]"),
    uptime: document.querySelector("[data-uptime]"),
    status: document.querySelector("[data-feed-status]"),
    screenTemp: document.querySelector("[data-screen-temp]"),
    buttons: [...document.querySelectorAll("[data-phase]")],
  };

  let index = 0;
  let started = Date.now();
  let phaseTimer = null;

  const rand = (min, max) => min + Math.random() * (max - min);
  const fmt = (n, d = 1) => n.toFixed(d);

  const setPhase = (next) => {
    index = ((next % phases.length) + phases.length) % phases.length;
    const phase = phases[index];

    els.buttons.forEach((btn, i) => btn.classList.toggle("is-active", i === index));
    els.body.setAttribute("data-mode", phase.id);

    if (els.phaseLabel) {
      els.phaseLabel.classList.add("is-swap");
      window.setTimeout(() => {
        els.phaseLabel.textContent = phase.label;
        if (els.phaseBadge) els.phaseBadge.textContent = phase.badge;
        els.phaseLabel.classList.remove("is-swap");
      }, 260);
    }

    if (els.cycle) els.cycle.textContent = phase.cycle;
    if (els.bio) els.bio.textContent = phase.bio;
    if (els.water) els.water.textContent = phase.water;
    if (els.power) els.power.textContent = phase.power;
  };

  const tickMetrics = () => {
    const phase = phases[index];
    const root = rand(...phase.root);
    const rh = Math.round(rand(...phase.rh));
    const comp = Math.round(rand(...phase.comp));

    if (els.root) els.root.textContent = fmt(root);
    if (els.rh) els.rh.textContent = String(rh);
    if (els.comp) els.comp.textContent = String(comp);
    if (els.screenTemp) els.screenTemp.textContent = `${Math.round(root)}°`;
    if (els.rootMeter) els.rootMeter.style.width = `${((root - 60) / 10) * 100}%`;
    if (els.rhMeter) els.rhMeter.style.width = `${rh}%`;
    if (els.compMeter) els.compMeter.style.width = `${comp}%`;
  };

  const tickUptime = () => {
    const elapsed = Math.floor((Date.now() - started) / 1000);
    const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
    const s = String(elapsed % 60).padStart(2, "0");
    if (els.uptime) els.uptime.textContent = `${h}:${m}:${s}`;
  };

  els.buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setPhase(Number(btn.dataset.phase));
      if (phaseTimer) {
        window.clearInterval(phaseTimer);
        if (!reduceMotion) {
          phaseTimer = window.setInterval(() => setPhase(index + 1), 5600);
        }
      }
    });
  });

  let cursorTimer = null;
  const showCursor = () => {
    document.body.classList.add("show-cursor");
    window.clearTimeout(cursorTimer);
    cursorTimer = window.setTimeout(() => {
      document.body.classList.remove("show-cursor");
    }, 2200);
  };
  window.addEventListener("pointermove", showCursor, { passive: true });
  window.addEventListener("keydown", (event) => {
    if (event.key === "f" || event.key === "F") {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    }
    if (event.key === "ArrowRight") setPhase(index + 1);
    if (event.key === "ArrowLeft") setPhase(index - 1);
  });

  setPhase(0);
  tickMetrics();
  tickUptime();

  if (!reduceMotion) {
    phaseTimer = window.setInterval(() => setPhase(index + 1), 5600);
    window.setInterval(tickMetrics, 1200);
  }
  window.setInterval(tickUptime, 1000);

  if (els.status) {
    window.setInterval(() => {
      els.status.textContent = Math.random() > 0.05 ? "SYSTEM SIMULATION" : "SYNC…";
    }, 8000);
  }
})();
