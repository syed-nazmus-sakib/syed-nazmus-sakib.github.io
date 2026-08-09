/* Pearl · Reward Models — shared TOC, theme, worked reveal */
(() => {
  "use strict";

  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const label = document.getElementById("themeToggleLabel");

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme) {
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    try {
      localStorage.setItem("pearl-theme", theme);
    } catch (e) {}
    if (label) label.textContent = theme === "light" ? "Dark" : "Light";
    if (toggle) {
      toggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      toggle.title =
        theme === "light"
          ? "Switch to dark roast"
          : "Switch to light milk tea";
    }
  }

  applyTheme(currentTheme());

  toggle?.addEventListener("click", () => {
    applyTheme(currentTheme() === "light" ? "dark" : "light");
  });

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
