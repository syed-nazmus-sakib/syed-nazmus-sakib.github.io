/* Pearl · RM Ch 01: Bradley–Terry scalar playground */

(() => {
  "use strict";

  function sigmoid(z) {
    if (z >= 0) {
      const e = Math.exp(-z);
      return 1 / (1 + e);
    }
    const e = Math.exp(z);
    return e / (1 + e);
  }

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function update() {
    const rwEl = document.getElementById("rwScore");
    const rlEl = document.getElementById("rlScore");
    if (!rwEl || !rlEl) return;

    const rw = Number(rwEl.value);
    const rl = Number(rlEl.value);
    const diff = rw - rl;
    const p = sigmoid(diff);
    const loss = -Math.log(Math.max(p, 1e-12));

    set("rwScoreL", rw.toFixed(1));
    set("rlScoreL", rl.toFixed(1));
    set("btDiff", diff.toFixed(2));
    set("btProb", (100 * p).toFixed(1) + "%");
    set("btLoss", loss.toFixed(4));

    const el = document.getElementById("scalarTrace");
    if (!el) return;
    if (diff > 2) {
      el.textContent =
        `r_w=${rw.toFixed(1)}, r_l=${rl.toFixed(1)} → Δ=${diff.toFixed(2)}\n` +
        `P(winner preferred)=σ(Δ)≈${p.toFixed(3)}. Loss≈${loss.toFixed(4)} (small).\n` +
        `Training barely needs to move these scores.`;
    } else if (diff < 0) {
      el.textContent =
        `The model ranks the loser higher (Δ=${diff.toFixed(2)}).\n` +
        `P(winner preferred)≈${p.toFixed(3)}. Loss≈${loss.toFixed(4)} (large).\n` +
        `Gradient will push r_w up and r_l down.`;
    } else {
      el.textContent =
        `Δ=${diff.toFixed(2)} → P≈${p.toFixed(3)}, loss≈${loss.toFixed(4)}.\n` +
        `Still prefers the winner, but not by much. More margin would lower the loss further.`;
    }
  }

  document.getElementById("rwScore")?.addEventListener("input", update);
  document.getElementById("rlScore")?.addEventListener("input", update);
  document.getElementById("scalarExampleGood")?.addEventListener("click", () => {
    const rw = document.getElementById("rwScore");
    const rl = document.getElementById("rlScore");
    if (rw) rw.value = "3";
    if (rl) rl.value = "1";
    update();
  });
  document.getElementById("scalarExampleBad")?.addEventListener("click", () => {
    const rw = document.getElementById("rwScore");
    const rl = document.getElementById("rlScore");
    if (rw) rw.value = "1";
    if (rl) rl.value = "3";
    update();
  });

  update();
})();
