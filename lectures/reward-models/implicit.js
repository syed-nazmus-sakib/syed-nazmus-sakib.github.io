/* Reward Models · RM Ch 11: implicit rewards, DPO loss and gradient weight for one pair */

(() => {
  "use strict";

  const PRESETS = {
    draft: { w: 2.0, l: 0.5, beta: 0.1 },
    fall: { w: -1.0, l: -3.0, beta: 0.1 },
    wrong: { w: -1.0, l: 1.0, beta: 0.1 }
  };

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  /* -log sigma(z), computed stably for large |z|. */
  function softplusNeg(z) {
    return z > 0 ? Math.log1p(Math.exp(-z)) : -z + Math.log1p(Math.exp(z));
  }

  function signed(x, d) {
    return (x >= 0 ? "+" : "") + x.toFixed(d);
  }

  function params() {
    const w = Number(document.getElementById("impW")?.value ?? 2);
    const l = Number(document.getElementById("impL")?.value ?? 0.5);
    const beta = Number(document.getElementById("impBeta")?.value ?? 0.1);
    return { w, l, beta };
  }

  function render() {
    const { w, l, beta } = params();
    set("impWL", w.toFixed(1));
    set("impLL", l.toFixed(1));
    set("impBetaL", beta.toFixed(2));

    const rw = beta * w;
    const rl = beta * l;
    const margin = rw - rl;
    const prob = sigmoid(margin);
    const loss = softplusNeg(margin);
    const weight = sigmoid(-margin);

    set("impRewards", `${signed(rw, 3)}, ${signed(rl, 3)}`);
    set("impMargin", signed(margin, 3));
    set("impProb", prob.toFixed(3));
    set("impLoss", loss.toFixed(3));
    set("impWeight", weight.toFixed(3));
    set("impLik", `×${Math.exp(w).toFixed(2)}, ×${Math.exp(l).toFixed(2)}`);

    const lines = [];
    lines.push(`log-ratios: winner ${signed(w, 1)}, loser ${signed(l, 1)}   (beta = ${beta.toFixed(2)})`);
    lines.push(`implicit rewards: r_w = ${beta.toFixed(2)} × ${w.toFixed(1)} = ${signed(rw, 3)},  r_l = ${beta.toFixed(2)} × ${l.toFixed(1)} = ${signed(rl, 3)}`);
    lines.push(`margin r_w − r_l = ${signed(margin, 3)}`);
    lines.push(`P(y_w ≻ y_l) = σ(${margin.toFixed(3)}) = ${prob.toFixed(3)}`);
    lines.push(`loss = −log σ(margin) = ${loss.toFixed(3)}   (start of training: log 2 = 0.693)`);
    lines.push(`gradient weight σ(r_l − r_w) = ${weight.toFixed(3)};  step size β × weight = ${(beta * weight).toFixed(4)}`);
    lines.push(`likelihood vs reference: winner ×${Math.exp(w).toFixed(2)}, loser ×${Math.exp(l).toFixed(2)}`);
    lines.push("");
    if (margin < 0) {
      lines.push("The implicit RM ranks the pair the wrong way: weight above 0.5, a large update.");
    } else if (weight < 0.1) {
      lines.push("The pair is already well separated: the weight is small and the pair is nearly ignored.");
    } else {
      lines.push("The pair is ranked correctly but not confidently: a moderate update.");
    }
    if (w < 0 && margin > 0) {
      lines.push("The winner is less likely than under the reference, yet the loss is low: only the margin matters.");
    }
    set("impTrace", lines.join("\n"));
  }

  function applyPreset(key) {
    const p = PRESETS[key];
    if (!p) return;
    const wEl = document.getElementById("impW");
    const lEl = document.getElementById("impL");
    const bEl = document.getElementById("impBeta");
    if (wEl) wEl.value = String(p.w);
    if (lEl) lEl.value = String(p.l);
    if (bEl) bEl.value = String(p.beta);
    render();
  }

  document.getElementById("impW")?.addEventListener("input", render);
  document.getElementById("impL")?.addEventListener("input", render);
  document.getElementById("impBeta")?.addEventListener("input", render);
  document.getElementById("impPresetDraft")?.addEventListener("click", () => applyPreset("draft"));
  document.getElementById("impPresetFall")?.addEventListener("click", () => applyPreset("fall"));
  document.getElementById("impPresetWrong")?.addEventListener("click", () => applyPreset("wrong"));
  render();
})();
