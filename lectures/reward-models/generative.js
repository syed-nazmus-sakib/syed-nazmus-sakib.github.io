/* Reward Models · RM Ch 09: averaging verdict probabilities over sampled critiques */

(() => {
  "use strict";

  const REPEATS = 500;

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function num(id, fallback) {
    const v = Number(document.getElementById(id)?.value ?? fallback);
    return Number.isFinite(v) ? v : fallback;
  }

  /* Each critique's verdict probability is Beta-distributed with mean p and
     standard deviation s (capped where a Beta cannot be that wide). */
  function params() {
    const p = num("genP", 0.7);
    const sWanted = num("genS", 0.2);
    const k = Math.max(1, Math.round(num("genK", 4)));
    const kappa = Math.max((p * (1 - p)) / (sWanted * sWanted) - 1, 1);
    const s = Math.sqrt((p * (1 - p)) / (kappa + 1));
    return { p, s, sWanted, k, a: p * kappa, b: (1 - p) * kappa };
  }

  function normal() {
    let u = 0;
    while (u === 0) u = Math.random();
    const v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /* Marsaglia–Tsang gamma sampler. */
  function gamma(shape) {
    if (shape < 1) {
      let u = 0;
      while (u === 0) u = Math.random();
      return gamma(shape + 1) * Math.pow(u, 1 / shape);
    }
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    for (;;) {
      const x = normal();
      let v = 1 + c * x;
      if (v <= 0) continue;
      v = v * v * v;
      const u = Math.random();
      if (u < 1 - 0.0331 * x ** 4) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  }

  function beta(a, b) {
    const x = gamma(a);
    const y = gamma(b);
    const t = x + y > 0 ? x / (x + y) : 0.5;
    return Math.min(0.999, Math.max(0.001, t));
  }

  function verdicts(cfg) {
    const out = [];
    for (let i = 0; i < cfg.k; i++) out.push(beta(cfg.a, cfg.b));
    return out;
  }

  const mean = (xs) => xs.reduce((s, v) => s + v, 0) / xs.length;

  function syncLabels() {
    const cfg = params();
    set("genPL", cfg.p.toFixed(2));
    set("genSL", cfg.s < cfg.sWanted - 0.005 ? `${cfg.s.toFixed(2)} (max)` : cfg.s.toFixed(2));
    set("genKL", String(cfg.k));
    return cfg;
  }

  function sampleOnce() {
    const cfg = syncLabels();
    const v = verdicts(cfg);
    const avg = mean(v);
    const yes = v.filter((q) => q >= 0.5).length;
    const se = cfg.s / Math.sqrt(cfg.k);

    set("genAvg", avg.toFixed(3));
    set("genSE", se.toFixed(3));
    set("genVote", `${yes}/${cfg.k} Yes → ${yes * 2 > cfg.k ? "accept" : yes * 2 === cfg.k ? "tie" : "reject"}`);

    const lines = v.map(
      (q, i) => `c${String(i + 1).padStart(2, " ")}: p(Yes | x, y, c) = ${q.toFixed(3)}  ${q >= 0.5 ? "Yes" : "No "}`
    );
    lines.push("");
    lines.push(`Average p̂_K = ${avg.toFixed(3)}   (marginal p = ${cfg.p.toFixed(2)}, error ${(avg - cfg.p >= 0 ? "+" : "") + (avg - cfg.p).toFixed(3)})`);
    lines.push(`Standard error = s / √K = ${cfg.s.toFixed(3)} / √${cfg.k} = ${se.toFixed(3)}`);
    const lo = Math.min(...v);
    const hi = Math.max(...v);
    lines.push(`Single verdicts ranged from ${lo.toFixed(3)} to ${hi.toFixed(3)}.`);
    set("genTrace", lines.join("\n"));
  }

  function wrongSide(avgs, p) {
    if (p === 0.5) return null;
    return avgs.filter((a) => (p > 0.5 ? a < 0.5 : a >= 0.5)).length;
  }

  function sampleMany() {
    const cfg = syncLabels();
    const avgs = [];
    const singles = [];
    for (let r = 0; r < REPEATS; r++) {
      const v = verdicts(cfg);
      avgs.push(mean(v));
      singles.push(v[0]);
    }
    const m = mean(avgs);
    const sd = Math.sqrt(avgs.reduce((s, a) => s + (a - m) ** 2, 0) / REPEATS);
    const theory = cfg.s / Math.sqrt(cfg.k);
    const wrongK = wrongSide(avgs, cfg.p);
    const wrong1 = wrongSide(singles, cfg.p);

    set("genAvg", `mean ${m.toFixed(3)}`);
    set("genSE", `${sd.toFixed(3)} (theory ${theory.toFixed(3)})`);
    set("genVote", wrongK === null ? "p = 0.5: no right side" : `${wrongK}/${REPEATS} wrong side`);

    const lines = [
      `${REPEATS} independent judgments, each averaging K = ${cfg.k} critique${cfg.k === 1 ? "" : "s"}.`,
      `Mean of the averages ${m.toFixed(3)} vs marginal ${cfg.p.toFixed(2)}: unbiased up to sampling noise.`,
      `Spread of the average ${sd.toFixed(3)}; one critique alone has spread ${cfg.s.toFixed(3)}.`,
      `Ratio ${(cfg.s / Math.max(sd, 1e-9)).toFixed(2)} ≈ √K = ${Math.sqrt(cfg.k).toFixed(2)}.`,
    ];
    if (wrongK !== null) {
      lines.push("");
      lines.push(`Decision at threshold 0.5 (correct side is ${cfg.p > 0.5 ? "≥ 0.5" : "< 0.5"}):`);
      if (cfg.k > 1) lines.push(`  K = 1:  ${wrong1}/${REPEATS} judgments on the wrong side`);
      lines.push(`  K = ${cfg.k}: ${wrongK}/${REPEATS} judgments on the wrong side`);
    }
    set("genTrace", lines.join("\n"));
  }

  document.getElementById("genP")?.addEventListener("input", syncLabels);
  document.getElementById("genS")?.addEventListener("input", syncLabels);
  document.getElementById("genK")?.addEventListener("input", syncLabels);
  document.getElementById("genSample")?.addEventListener("click", sampleOnce);
  document.getElementById("genMany")?.addEventListener("click", sampleMany);
  syncLabels();
})();
