/* Pearl · RM Ch 06: PRM step scores + aggregation */

(() => {
  "use strict";

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function clampQ(q) {
    return Math.min(0.999, Math.max(0.001, q));
  }

  function update() {
    const q1El = document.getElementById("prmQ1");
    const q2El = document.getElementById("prmQ2");
    const q3El = document.getElementById("prmQ3");
    const y3El = document.getElementById("prmY3");
    if (!q1El || !q2El || !q3El || !y3El) return;

    const q1 = clampQ(Number(q1El.value));
    const q2 = clampQ(Number(q2El.value));
    const q3 = clampQ(Number(q3El.value));
    const y3 = Number(y3El.value);
    const y = [1, 1, y3];
    const q = [q1, q2, q3];

    const prod = q1 * q2 * q3;
    const mn = Math.min(q1, q2, q3);
    const geo = Math.pow(prod, 1 / 3);
    const slog = (Math.log(q1) + Math.log(q2) + Math.log(q3)) / 3;

    let loss = 0;
    for (let t = 0; t < 3; t++) {
      const qt = q[t];
      const yt = y[t];
      loss -= yt * Math.log(qt) + (1 - yt) * Math.log(1 - qt);
    }
    loss /= 3;

    set("prmQ1L", q1.toFixed(2));
    set("prmQ2L", q2.toFixed(2));
    set("prmQ3L", q3.toFixed(2));
    set("prmY3L", "y = [1, 1, " + y3 + "]");
    set("prmProd", prod.toFixed(3));
    set("prmMin", mn.toFixed(2));
    set("prmGeo", geo.toFixed(3));
    set("prmLoss", loss.toFixed(4));

    const el = document.getElementById("prmTrace");
    if (!el) return;

    const winner =
      prod >= 0.5
        ? "Product is high: all steps look reasonably safe."
        : mn < 0.3
          ? "A weak step dominates: product and min both flag risk."
          : "Mixed scores. Compare product vs geo to see length/scale effects.";

    el.textContent =
      `q = [${q1.toFixed(2)}, ${q2.toFixed(2)}, ${q3.toFixed(2)}]\n` +
      `S_product = ${prod.toFixed(3)},  S_min = ${mn.toFixed(2)},  S_geo = ${geo.toFixed(3)}\n` +
      `S_log = ${slog.toFixed(3)}  (average log q)\n` +
      `L_PRM = ${loss.toFixed(4)} with labels y = [${y.join(", ")}]\n` +
      winner;
  }

  ["prmQ1", "prmQ2", "prmQ3", "prmY3"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", update);
  });

  function load(qs, y3) {
    document.getElementById("prmQ1").value = String(qs[0]);
    document.getElementById("prmQ2").value = String(qs[1]);
    document.getElementById("prmQ3").value = String(qs[2]);
    document.getElementById("prmY3").value = String(y3);
    update();
  }

  document.getElementById("prmExDiscount")?.addEventListener("click", () => {
    load([0.97, 0.92, 0.15], 0);
  });
  document.getElementById("prmExShirt")?.addEventListener("click", () => {
    load([0.98, 0.04, 0.02], 0);
  });
  document.getElementById("prmExA")?.addEventListener("click", () => {
    load([0.98, 0.96, 0.15], 0);
  });
  document.getElementById("prmExB")?.addEventListener("click", () => {
    load([0.88, 0.85, 0.82], 1);
  });

  update();
})();
