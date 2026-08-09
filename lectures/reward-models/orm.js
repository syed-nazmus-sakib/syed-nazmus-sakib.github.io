/* Pearl · RM Ch 05: ORM outcome playground */

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
    const logitEl = document.getElementById("ormLogit");
    const labelEl = document.getElementById("ormLabel");
    if (!logitEl || !labelEl) return;

    const a = Number(logitEl.value);
    const z = Number(labelEl.value);
    const p = sigmoid(a);
    const loss = -(
      z * Math.log(Math.max(p, 1e-12)) +
      (1 - z) * Math.log(Math.max(1 - p, 1e-12))
    );

    set("ormLogitL", a.toFixed(2));
    set("ormLabelL", z === 1 ? "correct (1)" : "incorrect (0)");
    set("ormProb", p.toFixed(3) + " (" + (100 * p).toFixed(1) + "%)");
    set("ormLoss", loss.toFixed(4));

    const el = document.getElementById("ormTrace");
    if (!el) return;

    if (z === 1) {
      el.textContent =
        `Outcome label z=1 (final answer correct).\n` +
        `p = σ(${a.toFixed(2)}) = ${p.toFixed(3)}. Loss = -log(p) = ${loss.toFixed(4)}.\n` +
        (p > 0.9
          ? "ORM is confident the finished solution succeeded. It still cannot say which step mattered."
          : "Correct outcome, but the model is unsure. Training pushes p toward 1.");
    } else {
      el.textContent =
        `Outcome label z=0 (final answer incorrect).\n` +
        `p = σ(${a.toFixed(2)}) = ${p.toFixed(3)}. Loss = -log(1-p) = ${loss.toFixed(4)}.\n` +
        (p < 0.1
          ? "ORM rejects the finished solution. Feedback is still only one sparse signal."
          : "Wrong outcome, but p is still high. Training pushes p toward 0.");
    }
  }

  document.getElementById("ormLogit")?.addEventListener("input", update);
  document.getElementById("ormLabel")?.addEventListener("input", update);

  document.getElementById("ormExA")?.addEventListener("click", () => {
    document.getElementById("ormLogit").value = "3.9";
    document.getElementById("ormLabel").value = "1";
    update();
  });
  document.getElementById("ormExB")?.addEventListener("click", () => {
    document.getElementById("ormLogit").value = "-3.2";
    document.getElementById("ormLabel").value = "0";
    update();
  });
  document.getElementById("ormExLucky")?.addEventListener("click", () => {
    document.getElementById("ormLogit").value = "3.5";
    document.getElementById("ormLabel").value = "1";
    update();
    const el = document.getElementById("ormTrace");
    if (el) {
      el.textContent =
        "Lucky case: Step 1 wrong, final answer accidentally correct, z=1.\n" +
        `p ≈ ${sigmoid(3.5).toFixed(3)}. ORM may reward this trajectory.\n` +
        "It cannot mark Step 1 as the failure point. That is the PRM job.";
    }
  });

  update();
})();
