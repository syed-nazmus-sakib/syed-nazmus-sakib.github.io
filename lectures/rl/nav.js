/* Reinforcement Learning — shared TOC scroll-spy, worked-example reveal */
(() => {
  "use strict";

  // ---------- TOC scroll-spy ----------
  const links = [...document.querySelectorAll(".toc a")];
  const sections = links
    .map((a) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return null;
      return document.querySelector(href);
    })
    .filter(Boolean);

  if (links.length && sections.length) {
    const sync = () => {
      let current = sections[0];
      for (const sec of sections) {
        if (sec.getBoundingClientRect().top <= 120) current = sec;
      }
      if (!current?.id) return;
      links.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${current.id}`)
      );
    };
    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  // ---------- Worked-example reveal ----------
  let revealIdx = 0;
  const steps = [...document.querySelectorAll("#workedSteps li")];
  if (steps.length) {
    const show = (n) => {
      steps.forEach((li, i) => {
        li.classList.toggle("show", i < n);
        li.classList.toggle("hidden-step", i >= n);
      });
    };
    document.getElementById("revealNext")?.addEventListener("click", () => {
      revealIdx = Math.min(revealIdx + 1, steps.length);
      show(revealIdx);
    });
    document.getElementById("revealAll")?.addEventListener("click", () => {
      revealIdx = steps.length;
      show(revealIdx);
    });
    show(0);
  }

  // Keyboard activation for elements marked data-keys
  document.querySelectorAll("[data-keys]").forEach((el) => {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
    if (!el.getAttribute("role")) el.setAttribute("role", "button");
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    });
  });
})();
