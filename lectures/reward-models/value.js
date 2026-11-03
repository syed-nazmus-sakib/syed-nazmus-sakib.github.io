/* Reward Models · RM Ch 07: Monte-Carlo value labels from rollouts */

(() => {
  "use strict";

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function params() {
    const v = Number(document.getElementById("valTrue")?.value ?? 0.6);
    const m = Number(document.getElementById("valM")?.value ?? 5);
    return { v, m };
  }

  function rollouts(v, m) {
    const out = [];
    for (let i = 0; i < m; i++) out.push(Math.random() < v ? 1 : 0);
    return out;
  }

  function syncLabels() {
    const { v, m } = params();
    set("valTrueL", v.toFixed(2));
    set("valML", String(m));
  }

  function sampleOnce() {
    syncLabels();
    const { v, m } = params();
    const r = rollouts(v, m);
    const hat = r.reduce((a, b) => a + b, 0) / m;
    const se = Math.sqrt((v * (1 - v)) / m);
    const lo = Math.max(0, hat - 1.96 * se);
    const hi = Math.min(1, hat + 1.96 * se);
    set("valHat", hat.toFixed(3));
    set("valSE", se.toFixed(3));
    set("valCI", `[${lo.toFixed(2)}, ${hi.toFixed(2)}]`);
    set(
      "valTrace",
      `Outcomes (1 = correct final answer): [${r.join(", ")}]\n` +
        `V̂ = ${r.reduce((a, b) => a + b, 0)}/${m} = ${hat.toFixed(3)}   (true V = ${v.toFixed(2)}, error ${(hat - v >= 0 ? "+" : "") + (hat - v).toFixed(3)})`
    );
  }

  function sampleMany() {
    syncLabels();
    const { v, m } = params();
    const n = 200;
    const labels = [];
    for (let i = 0; i < n; i++) {
      const r = rollouts(v, m);
      labels.push(r.reduce((a, b) => a + b, 0) / m);
    }
    const mean = labels.reduce((a, b) => a + b, 0) / n;
    const sd = Math.sqrt(labels.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
    const far = labels.filter((l) => Math.abs(l - v) > 0.2).length;
    const se = Math.sqrt((v * (1 - v)) / m);
    set("valHat", `mean ${mean.toFixed(3)}`);
    set("valSE", `${sd.toFixed(3)} (theory ${se.toFixed(3)})`);
    set("valCI", `${far}/${n} off by > 0.2`);
    set(
      "valTrace",
      `200 independent labels, each from M = ${m} rollouts.\n` +
        `Mean label ${mean.toFixed(3)} vs true ${v.toFixed(2)}: unbiased on average.\n` +
        `Spread ${sd.toFixed(3)}: ${far} of ${n} labels are more than 0.2 away from the truth.`
    );
  }

  document.getElementById("valTrue")?.addEventListener("input", syncLabels);
  document.getElementById("valM")?.addEventListener("input", syncLabels);
  document.getElementById("valSample")?.addEventListener("click", sampleOnce);
  document.getElementById("valMany")?.addEventListener("click", sampleMany);
  syncLabels();
})();
