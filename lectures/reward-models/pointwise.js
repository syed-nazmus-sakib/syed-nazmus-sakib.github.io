/* Pearl · RM Ch 02: pointwise BCE playground */

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
    const logitEl = document.getElementById("pwLogit");
    const labelEl = document.getElementById("pwLabel");
    if (!logitEl || !labelEl) return;
    const a = Number(logitEl.value);
    const z = Number(labelEl.value);
    const p = sigmoid(a);
    const loss = -(z * Math.log(Math.max(p, 1e-12)) + (1 - z) * Math.log(Math.max(1 - p, 1e-12)));

    set("pwLogitL", a.toFixed(2));
    set("pwLabelL", z === 1 ? "correct (1)" : "incorrect (0)");
    set("pwProb", (100 * p).toFixed(1) + "%");
    set("pwLoss", loss.toFixed(4));

    const el = document.getElementById("pwTrace");
    if (!el) return;
    if (z === 1) {
      el.textContent =
        `Label z=1 (correct). Loss = -log(p) = ${loss.toFixed(4)}.\n` +
        (p > 0.8
          ? "Model is confident and right. Small loss."
          : "Model under-rates a correct answer. Push p toward 1.");
    } else {
      el.textContent =
        `Label z=0 (incorrect). Loss = -log(1-p) = ${loss.toFixed(4)}.\n` +
        (p < 0.2
          ? "Model is confident and right about rejecting it."
          : "Model still gives this wrong answer too much mass. Push p toward 0.");
    }
  }

  document.getElementById("pwLogit")?.addEventListener("input", update);
  document.getElementById("pwLabel")?.addEventListener("input", update);
  document.getElementById("pwExGood")?.addEventListener("click", () => {
    document.getElementById("pwLogit").value = "2.2";
    document.getElementById("pwLabel").value = "1";
    update();
  });
  document.getElementById("pwExBad")?.addEventListener("click", () => {
    document.getElementById("pwLogit").value = "2.2";
    document.getElementById("pwLabel").value = "0";
    update();
  });
  update();
})();
