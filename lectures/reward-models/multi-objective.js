/* Reward Models · RM Ch 08: weighted scalarisation of two score vectors */

(() => {
  "use strict";

  const NAMES = ["correctness", "helpfulness", "safety"];
  const A = [0.98, 0.75, 0.4];
  const B = [0.9, 0.85, 0.95];
  const SAFE = 2;

  const PRESETS = {
    moPresetCorrect: [1, 0, 0],
    moPresetEqual: [1, 1, 1],
    moPresetSafe: [0.3, 0.2, 0.5],
  };

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function num(id, fallback) {
    const v = Number(document.getElementById(id)?.value ?? fallback);
    return Number.isFinite(v) ? v : fallback;
  }

  function params() {
    const raw = [num("moLc", 0.5), num("moLh", 0.3), num("moLs", 0.2)];
    const tau = num("moTau", 0);
    return { raw, tau };
  }

  function combine(r, lam) {
    return r.reduce((s, v, k) => s + lam[k] * v, 0);
  }

  function fmtSigned(v) {
    return (v >= 0 ? "+" : "") + v.toFixed(3);
  }

  function render() {
    const { raw, tau } = params();
    set("moLcL", raw[0].toFixed(2));
    set("moLhL", raw[1].toFixed(2));
    set("moLsL", raw[2].toFixed(2));
    set("moTauL", tau > 0 ? tau.toFixed(2) : "off");

    const total = raw[0] + raw[1] + raw[2];
    if (total <= 0) {
      set("moRA", "-");
      set("moRB", "-");
      set("moWin", "-");
      set("moTrace", "All weights are zero. Set at least one weight above 0.");
      return;
    }
    const lam = raw.map((v) => v / total);
    const ra = combine(A, lam);
    const rb = combine(B, lam);

    const okA = tau <= 0 || A[SAFE] >= tau;
    const okB = tau <= 0 || B[SAFE] >= tau;

    set("moRA", okA ? ra.toFixed(3) : `${ra.toFixed(3)} (excluded)`);
    set("moRB", okB ? rb.toFixed(3) : `${rb.toFixed(3)} (excluded)`);

    let winner;
    if (!okA && !okB) winner = "neither passes";
    else if (!okA) winner = "B (A fails τ)";
    else if (!okB) winner = "A (B fails τ)";
    else if (Math.abs(ra - rb) < 5e-4) winner = "tie";
    else winner = ra > rb ? "A" : "B";
    set("moWin", winner);

    const lines = [];
    lines.push(
      `Normalised weights: λ = (${lam.map((v) => v.toFixed(3)).join(", ")})   [raw sum ${total.toFixed(2)}]`
    );
    lines.push("");
    lines.push(
      `R_A = ${lam.map((l, k) => `${l.toFixed(3)}·${A[k].toFixed(2)}`).join(" + ")} = ${ra.toFixed(3)}`
    );
    lines.push(
      `R_B = ${lam.map((l, k) => `${l.toFixed(3)}·${B[k].toFixed(2)}`).join(" + ")} = ${rb.toFixed(3)}`
    );
    lines.push("");
    const parts = lam.map((l, k) => l * (A[k] - B[k]));
    lines.push("Margin R_A − R_B by head:");
    parts.forEach((p, k) => {
      lines.push(`  ${NAMES[k].padEnd(12)} ${fmtSigned(A[k] - B[k])} × ${lam[k].toFixed(3)} = ${fmtSigned(p)}`);
    });
    lines.push(`  total        ${fmtSigned(ra - rb)}`);

    if (lam[2] === 0) {
      lines.push("");
      lines.push("With no safety weight, A wins iff λ₁ > 0.10 / 0.18 ≈ 0.556 (relative to λ₁ + λ₂).");
    }

    if (tau > 0) {
      lines.push("");
      lines.push(`Safety constraint r_safe ≥ ${tau.toFixed(2)}:`);
      lines.push(`  A: r_safe = ${A[SAFE].toFixed(2)} → ${okA ? "passes" : "ruled out"}`);
      lines.push(`  B: r_safe = ${B[SAFE].toFixed(2)} → ${okB ? "passes" : "ruled out"}`);
    }
    set("moTrace", lines.join("\n"));
  }

  function applyPreset(id) {
    const w = PRESETS[id];
    if (!w) return;
    ["moLc", "moLh", "moLs"].forEach((sid, k) => {
      const el = document.getElementById(sid);
      if (el) el.value = String(w[k]);
    });
    render();
  }

  ["moLc", "moLh", "moLs", "moTau"].forEach((id) =>
    document.getElementById(id)?.addEventListener("input", render)
  );
  Object.keys(PRESETS).forEach((id) =>
    document.getElementById(id)?.addEventListener("click", () => applyPreset(id))
  );
  render();
})();
