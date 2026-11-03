/* Reward Models · RM Ch 10: majority-vote accuracy of N sampled critiques */

(() => {
  "use strict";

  const MAX_N = 31;

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function params() {
    const p = Number(document.getElementById("critP")?.value ?? 0.7);
    let n = Number(document.getElementById("critN")?.value ?? 5);
    if (n % 2 === 0) n += 1;
    const rho = Number(document.getElementById("critRho")?.value ?? 0);
    return { p, n, rho };
  }

  function binom(n, k) {
    let r = 1;
    for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
    return r;
  }

  /* Exact majority accuracy for independent votes, odd n (Equation 12). */
  function majority(p, n) {
    let s = 0;
    for (let k = (n + 1) / 2; k <= n; k++) s += binom(n, k) * p ** k * (1 - p) ** (n - k);
    return s;
  }

  /* Shared-error mixture (Equation 14). */
  function accuracy(p, n, rho) {
    return rho * p + (1 - rho) * majority(p, n);
  }

  function limit(p, rho) {
    const indep = p > 0.5 ? 1 : p < 0.5 ? 0 : 0.5;
    return rho * p + (1 - rho) * indep;
  }

  function signed(x) {
    return (x >= 0 ? "+" : "") + x.toFixed(3);
  }

  function bar(a) {
    const width = 30;
    const filled = Math.round(a * width);
    return "#".repeat(filled) + ".".repeat(width - filled);
  }

  function render() {
    const { p, n, rho } = params();
    set("critPL", p.toFixed(2));
    set("critNL", String(n));
    set("critRhoL", rho.toFixed(2));

    const one = p;
    const maj = accuracy(p, n, rho);
    set("critOne", one.toFixed(3));
    set("critMaj", maj.toFixed(3));
    set("critGain", signed(maj - one));
    set("critLim", limit(p, rho).toFixed(3));

    const lines = [];
    lines.push(`p = ${p.toFixed(2)}, rho = ${rho.toFixed(2)}`);
    lines.push("  N   accuracy   bar from 0 to 1");
    for (let k = 1; k <= MAX_N; k += 2) {
      const a = accuracy(p, k, rho);
      const mark = k === n ? "  <- current N" : "";
      lines.push(`${String(k).padStart(3)}   ${a.toFixed(4)}     ${bar(a)}${mark}`);
    }
    if (p > 0.5) lines.push("p > 0.5: each extra pair of votes raises accuracy.");
    else if (p < 0.5) lines.push("p < 0.5: each extra pair of votes lowers accuracy.");
    else lines.push("p = 0.5: voting leaves accuracy at 0.5.");
    if (rho > 0) lines.push(`Shared errors cap accuracy at ${limit(p, rho).toFixed(3)} however many votes are taken.`);
    set("critTrace", lines.join("\n"));
  }

  function simulate() {
    render();
    const { p, n, rho } = params();
    const trials = 2000;
    let wins = 0;
    for (let t = 0; t < trials; t++) {
      let correct = 0;
      if (Math.random() < rho) {
        correct = Math.random() < p ? n : 0;
      } else {
        for (let i = 0; i < n; i++) if (Math.random() < p) correct++;
      }
      if (correct >= (n + 1) / 2) wins++;
    }
    const emp = wins / trials;
    const exact = accuracy(p, n, rho);
    const se = Math.sqrt((exact * (1 - exact)) / trials);
    set("critMaj", `${emp.toFixed(3)} (exact ${exact.toFixed(3)})`);
    set(
      "critTrace",
      `${trials} simulated pairs, each judged by N = ${n} sampled critiques.\n` +
        `Majority correct on ${wins} of ${trials}: empirical ${emp.toFixed(3)}.\n` +
        `Exact value ${exact.toFixed(3)}; sampling error about ±${(1.96 * se).toFixed(3)} (95%).`
    );
  }

  document.getElementById("critP")?.addEventListener("input", render);
  document.getElementById("critN")?.addEventListener("input", render);
  document.getElementById("critRho")?.addEventListener("input", render);
  document.getElementById("critSim")?.addEventListener("click", simulate);
  render();
})();
