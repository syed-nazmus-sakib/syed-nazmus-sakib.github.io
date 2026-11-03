/* Reward Models · RM Ch 12: conditional reward vs a single pooled reward model */

(() => {
  "use strict";

  // Rewards from Equation (2): user A (w = 0) and user B (w = 1).
  const R = {
    y1: { a: 0.92, b: 0.55 },
    y2: { a: 0.61, b: 0.95 },
  };

  const sigmoid = (z) => 1 / (1 + Math.exp(-z));
  const logit = (p) => Math.log(p / (1 - p));
  const fmtSigned = (v, d = 3) => (v >= 0 ? "+" : "") + v.toFixed(d);

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function params() {
    const w = Number(document.getElementById("condW")?.value ?? 0.2);
    const pi = Number(document.getElementById("condPi")?.value ?? 0.5);
    return { w, pi };
  }

  const reward = (y, w) => (1 - w) * R[y].a + w * R[y].b;

  // Crossover: r(y1,w) = r(y2,w)  =>  0.92 - 0.37w = 0.61 + 0.34w.
  const slope1 = R.y1.b - R.y1.a;
  const slope2 = R.y2.b - R.y2.a;
  const wStar = (R.y1.a - R.y2.a) / (slope2 - slope1);

  // Group probabilities that y2 beats y1 (Bradley-Terry with each user's rewards).
  const pA = sigmoid(R.y2.a - R.y1.a);
  const pB = sigmoid(R.y2.b - R.y1.b);

  function renderBars(r1, r2) {
    const host = document.getElementById("condBars");
    if (!host) return;
    host.textContent = "";
    [
      ["y1 short", r1],
      ["y2 detail", r2],
    ].forEach(([label, v]) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      const name = document.createElement("span");
      name.textContent = label;
      const track = document.createElement("div");
      track.className = "bar-track";
      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.width = `${(Math.max(0, Math.min(1, v)) * 100).toFixed(1)}%`;
      track.appendChild(fill);
      const val = document.createElement("span");
      val.textContent = v.toFixed(3);
      row.append(name, track, val);
      host.appendChild(row);
    });
  }

  function render() {
    const { w, pi } = params();
    set("condWL", w.toFixed(2));
    set("condPiL", pi.toFixed(2));

    const r1 = reward("y1", w);
    const r2 = reward("y2", w);
    const margin = r2 - r1;
    const pUser = sigmoid(margin);
    const prefers = Math.abs(margin) < 1e-9 ? "tie" : margin > 0 ? "y2 (detailed)" : "y1 (short)";

    const pPool = (1 - pi) * pA + pi * pB;
    const single = logit(pPool);
    const singlePick = Math.abs(single) < 1e-9 ? "tie" : single > 0 ? "y2 (detailed)" : "y1 (short)";
    const agrees = prefers === singlePick;

    set("condR1", r1.toFixed(3));
    set("condR2", r2.toFixed(3));
    set("condPref", prefers);
    set("condCross", wStar.toFixed(3));
    set("condPool", pPool.toFixed(3));
    set("condSingle", fmtSigned(single));
    set("condSinglePick", singlePick);
    renderBars(r1, r2);

    set(
      "condTrace",
      `User weight on depth w = ${w.toFixed(2)}   (0 = concise user A, 1 = detailed user B)\n` +
        `r(y1, w) = 0.92 - 0.37·${w.toFixed(2)} = ${r1.toFixed(3)}\n` +
        `r(y2, w) = 0.61 + 0.34·${w.toFixed(2)} = ${r2.toFixed(3)}\n` +
        `margin r(y2) - r(y1) = ${fmtSigned(margin)}   P(y2 ≻ y1 | w) = σ(${fmtSigned(margin)}) = ${pUser.toFixed(3)}\n` +
        `Crossover w* = 0.31 / 0.71 = ${wStar.toFixed(3)}; this user prefers ${prefers}.\n\n` +
        `Single RM on pooled labels (share of user-B labels π = ${pi.toFixed(2)}):\n` +
        `P_A(y2 ≻ y1) = σ(-0.31) = ${pA.toFixed(3)},  P_B(y2 ≻ y1) = σ(0.40) = ${pB.toFixed(3)}\n` +
        `P_pool = ${(1 - pi).toFixed(2)}·${pA.toFixed(3)} + ${pi.toFixed(2)}·${pB.toFixed(3)} = ${pPool.toFixed(3)}\n` +
        `margin = logit(${pPool.toFixed(3)}) = ${fmtSigned(single)}  ->  ${singlePick} for every user.\n` +
        (agrees
          ? "The single RM happens to agree with this user."
          : "The single RM disagrees with this user: without c it cannot serve both groups.")
    );
  }

  document.getElementById("condW")?.addEventListener("input", render);
  document.getElementById("condPi")?.addEventListener("input", render);
  render();
})();
