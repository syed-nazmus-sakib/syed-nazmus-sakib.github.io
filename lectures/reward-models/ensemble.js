/* Reward Models · RM Ch 13: ranking answers by ensemble mean, spread and worst case */

(() => {
  "use strict";

  const PRESETS = {
    default: {
      A: [0.66, 0.63, 0.67, 0.64],
      B: [0.99, 0.55, 0.97, 0.69],
      C: [0.79, 0.66, 0.81, 0.62],
    },
    shared: {
      A: [0.66, 0.63, 0.67, 0.64],
      B: [0.93, 0.91, 0.95, 0.92],
      C: [0.79, 0.66, 0.81, 0.62],
    },
  };

  // State is initialised before the first render.
  let presetName = "default";

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function lambda() {
    return Number(document.getElementById("ensLambda")?.value ?? 1);
  }

  function stats(scores) {
    const k = scores.length;
    const mu = scores.reduce((a, b) => a + b, 0) / k;
    const v = scores.reduce((a, b) => a + (b - mu) ** 2, 0) / k;
    return { mu, sigma: Math.sqrt(v), min: Math.min(...scores) };
  }

  const best = (rows, key) => rows.reduce((a, b) => (b[key] > a[key] ? b : a)).name;

  function renderBars(rows) {
    const host = document.getElementById("ensBars");
    if (!host) return;
    host.textContent = "";
    rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      const name = document.createElement("span");
      name.textContent = `Answer ${r.name}`;
      const track = document.createElement("div");
      track.className = "bar-track";
      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.width = `${(Math.max(0, Math.min(1, r.pen)) * 100).toFixed(1)}%`;
      track.appendChild(fill);
      const val = document.createElement("span");
      val.textContent = r.pen.toFixed(3);
      row.append(name, track, val);
      host.appendChild(row);
    });
  }

  function crossovers(rows) {
    const lines = [];
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const p = rows[i];
        const q = rows[j];
        const dSigma = p.sigma - q.sigma;
        if (Math.abs(dSigma) < 1e-12) continue;
        const l = (p.mu - q.mu) / dSigma;
        if (l > 0) lines.push(`${p.name} and ${q.name} tie at λ = ${l.toFixed(3)}`);
        else lines.push(`${p.name} and ${q.name} never swap for λ > 0`);
      }
    }
    return lines;
  }

  function render() {
    const lam = lambda();
    set("ensLambdaL", lam.toFixed(2));
    const preset = PRESETS[presetName];
    const rows = Object.keys(preset).map((name) => {
      const s = stats(preset[name]);
      return { name, scores: preset[name], ...s, pen: s.mu - lam * s.sigma };
    });

    const ranked = [...rows].sort((a, b) => b.pen - a.pen);
    set("ensPickMean", best(rows, "mu"));
    set("ensPickPen", best(rows, "pen"));
    set("ensPickMin", best(rows, "min"));
    set("ensRank", ranked.map((r) => r.name).join(" ≻ "));
    renderBars(rows);

    const k = rows[0].scores.length;
    const thr = Math.sqrt(k - 1);
    const table = rows
      .map(
        (r) =>
          `${r.name}  [${r.scores.map((v) => v.toFixed(2)).join(", ")}]  ` +
          `μ=${r.mu.toFixed(3)}  σ=${r.sigma.toFixed(3)}  ` +
          `μ-λσ=${r.pen.toFixed(3)}  min=${r.min.toFixed(2)}`
      )
      .join("\n");

    set(
      "ensTrace",
      `Preset: ${presetName === "default" ? "contested B" : "shared error on B"}   λ = ${lam.toFixed(2)}   K = ${k}\n\n` +
        `${table}\n\n` +
        `Ranking by μ-λσ: ${ranked.map((r) => r.name).join(" ≻ ")}\n` +
        `${crossovers(rows).join("\n")}\n` +
        (lam >= thr
          ? `λ ≥ √(K-1) = ${thr.toFixed(3)}: μ-λσ is now at or below every member's minimum (Proposition 13.1).`
          : `Proposition 13.1: once λ ≥ √(K-1) = ${thr.toFixed(3)}, μ-λσ is at least as pessimistic as the min.`)
    );
  }

  function choose(name) {
    presetName = name;
    document.getElementById("ensPresetDefault")?.classList.toggle("primary", name === "default");
    document.getElementById("ensPresetShared")?.classList.toggle("primary", name === "shared");
    render();
  }

  document.getElementById("ensLambda")?.addEventListener("input", render);
  document.getElementById("ensPresetDefault")?.addEventListener("click", () => choose("default"));
  document.getElementById("ensPresetShared")?.addEventListener("click", () => choose("shared"));
  render();
})();
