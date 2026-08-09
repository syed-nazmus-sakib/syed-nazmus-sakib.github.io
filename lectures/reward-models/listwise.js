/* Pearl · RM Ch 04: listwise Plackett-Luce playground */

(() => {
  "use strict";

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function update() {
    const ids = ["lwA", "lwB", "lwC"];
    const s = ids.map((id) => Number(document.getElementById(id).value));
    const labels = ["A", "B", "C"];
    labels.forEach((L, i) => set("lw" + L + "L", s[i].toFixed(1)));

    const ex = s.map((v) => Math.exp(v));
    const z = ex.reduce((a, b) => a + b, 0);
    const pFirst = ex.map((e) => e / z);

    // Assume true order A > B > C for loss demo
    const pABC =
      ex[0] / (ex[0] + ex[1] + ex[2]) * (ex[1] / (ex[1] + ex[2]));
    const loss = -Math.log(Math.max(pABC, 1e-12));

    set("lwPA", (100 * pFirst[0]).toFixed(1) + "%");
    set("lwPB", (100 * pFirst[1]).toFixed(1) + "%");
    set("lwPC", (100 * pFirst[2]).toFixed(1) + "%");
    set("lwRankP", pABC.toFixed(4));
    set("lwLoss", loss.toFixed(4));

    const order = [0, 1, 2].sort((i, j) => s[j] - s[i]).map((i) => labels[i]);
    const el = document.getElementById("lwTrace");
    if (el) {
      el.textContent =
        `Scores → implied ranking: ${order.join(" > ")}\n` +
        `P(A best)=${pFirst[0].toFixed(3)}, P(B best)=${pFirst[1].toFixed(3)}, P(C best)=${pFirst[2].toFixed(3)}\n` +
        `If true order is A≻B≻C, Plackett-Luce P≈${pABC.toFixed(4)}, loss≈${loss.toFixed(4)}.`;
    }
  }

  ["lwA", "lwB", "lwC"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", update);
  });
  document.getElementById("lwGood")?.addEventListener("click", () => {
    document.getElementById("lwA").value = "5";
    document.getElementById("lwB").value = "3";
    document.getElementById("lwC").value = "0";
    update();
  });
  document.getElementById("lwBad")?.addEventListener("click", () => {
    document.getElementById("lwA").value = "1";
    document.getElementById("lwB").value = "4";
    document.getElementById("lwC").value = "2";
    update();
  });
  update();
})();
