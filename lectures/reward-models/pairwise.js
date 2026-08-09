/* Pearl · RM Ch 03: direct comparator playground */

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
    const gEl = document.getElementById("cmpG");
    const zEl = document.getElementById("cmpZ");
    if (!gEl || !zEl) return;
    const g = Number(gEl.value);
    const z = Number(zEl.value);
    const p = sigmoid(g);
    const loss = -(z * Math.log(Math.max(p, 1e-12)) + (1 - z) * Math.log(Math.max(1 - p, 1e-12)));
    set("cmpGL", g.toFixed(2));
    set("cmpZL", z === 1 ? "A wins" : "B wins");
    set("cmpP", (100 * p).toFixed(1) + "%");
    set("cmpLoss", loss.toFixed(4));
    set("cmpSwap", (100 * (1 - p)).toFixed(1) + "%");

    const el = document.getElementById("cmpTrace");
    if (!el) return;
    el.textContent =
      `Comparator logit g(x,A,B)=${g.toFixed(2)} → P(A≻B)=${p.toFixed(3)}.\n` +
      `Ideal swap: P(B≻A) should be ${(1 - p).toFixed(3)}. Position bias can break that.\n` +
      `Label: ${z === 1 ? "A preferred" : "B preferred"}. Loss=${loss.toFixed(4)}.`;
  }

  document.getElementById("cmpG")?.addEventListener("input", update);
  document.getElementById("cmpZ")?.addEventListener("input", update);
  update();
})();
