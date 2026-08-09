/* Pearl — Ch 09: GRPO group-relative laboratory (contextual bandit) */

(() => {
  "use strict";

  const ACTIONS = ["A", "B", "C", "D"];
  // Fixed environment rewards for the single "prompt"
  const TRUE_R = [0.25, 0.95, 0.45, 0.1];

  const S = {
    logits: ACTIONS.map(() => 0),
    refLogits: ACTIONS.map(() => 0),
    G: 8,
    eps: 0.2,
    beta: 0.04,
    group: null, // {actions, rewards, adv, oldLogP}
  };

  function softmax(logits) {
    const m = Math.max(...logits);
    const ex = logits.map((z) => Math.exp(z - m));
    const z = ex.reduce((a, b) => a + b, 0);
    return ex.map((e) => e / z);
  }

  function sample(logits) {
    const p = softmax(logits);
    let u = Math.random();
    for (let i = 0; i < p.length; i++) {
      u -= p[i];
      if (u <= 0) return i;
    }
    return p.length - 1;
  }

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function clip(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
  }

  function kl(p, q) {
    let s = 0;
    for (let i = 0; i < p.length; i++) {
      const pi = Math.max(p[i], 1e-12);
      const qi = Math.max(q[i], 1e-12);
      s += pi * Math.log(pi / qi);
    }
    return s;
  }

  function entropy(p) {
    return -p.reduce((s, x) => s + (x > 0 ? x * Math.log(x) : 0), 0);
  }

  function renderBars() {
    const el = document.getElementById("grpoBars");
    if (!el) return;
    const p = softmax(S.logits);
    const pref = softmax(S.refLogits);
    el.innerHTML = "";
    ACTIONS.forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML =
        `<span>${name} · R*=${TRUE_R[i].toFixed(2)}</span>` +
        `<div class="bar-track"><div class="bar-fill" style="width:${(p[i] * 100).toFixed(1)}%"></div></div>` +
        `<span>${p[i].toFixed(3)}</span>`;
      el.appendChild(row);
      const sub = document.createElement("div");
      sub.className = "bar-row";
      sub.style.opacity = "0.55";
      sub.innerHTML =
        `<span>π_ref</span>` +
        `<div class="bar-track"><div class="bar-fill" style="width:${(pref[i] * 100).toFixed(1)}%;background:var(--pearl-mint)"></div></div>` +
        `<span>${pref[i].toFixed(3)}</span>`;
      el.appendChild(sub);
    });
    set("grpoEnt", entropy(p).toFixed(3));
    set("grpoKL", kl(pref, p).toFixed(4));
  }

  function renderGroup() {
    const el = document.getElementById("grpoGroup");
    if (!el) return;
    if (!S.group) {
      el.innerHTML = `<p class="caption tight">Sample a group to see R_i and Â_i.</p>`;
      return;
    }
    const { actions, rewards, adv } = S.group;
    let html = `<table class="practice-table"><thead><tr><th>#</th><th>o</th><th>R</th><th>Â</th></tr></thead><tbody>`;
    for (let i = 0; i < actions.length; i++) {
      html += `<tr><td>${i + 1}</td><td>${ACTIONS[actions[i]]}</td><td>${rewards[i].toFixed(3)}</td><td>${adv[i].toFixed(3)}</td></tr>`;
    }
    html += `</tbody></table>`;
    el.innerHTML = html;
  }

  function sampleGroup() {
    const actions = [];
    const rewards = [];
    const oldLogP = [];
    const p = softmax(S.logits);
    for (let i = 0; i < S.G; i++) {
      const a = sample(S.logits);
      actions.push(a);
      rewards.push(TRUE_R[a]);
      oldLogP.push(Math.log(Math.max(p[a], 1e-12)));
    }
    const mean = rewards.reduce((a, b) => a + b, 0) / rewards.length;
    const var_ =
      rewards.reduce((a, b) => a + (b - mean) ** 2, 0) / rewards.length;
    const std = Math.sqrt(var_);
    const adv = rewards.map((r) => (std < 1e-8 ? 0 : (r - mean) / (std + 1e-8)));

    S.group = { actions, rewards, adv, oldLogP, mean, std };

    set("grpoMean", mean.toFixed(3));
    set("grpoStd", std.toFixed(3));
    set("grpoClipFrac", "—");

    const el = document.getElementById("grpoTrace");
    if (el) {
      if (std < 1e-8) {
        el.textContent =
          `Group of ${S.G}: all rewards equal (std≈0).\n` +
          `Â_i = 0 for every sample → clipped surrogate gives NO policy gradient.\n` +
          `Only the KL term toward π_ref can still move θ.`;
      } else {
        el.textContent =
          `Sampled G=${S.G} completions from π_old for one prompt.\n` +
          `mean(R)=${mean.toFixed(3)}  std(R)=${std.toFixed(3)}\n` +
          `Â_i = (R_i − mean) / std  (group-relative — no V_φ)\n` +
          `Next: GRPO step applies L^CLIP with these Â, minus β KL(π‖π_ref).`;
      }
    }
    renderGroup();
    renderBars();
  }

  function grpoStep() {
    if (!S.group) {
      const el = document.getElementById("grpoTrace");
      if (el) el.textContent = "Sample a group first.";
      return;
    }
    const { actions, adv, oldLogP, std } = S.group;
    const eps = S.eps;
    const beta = S.beta;
    const lr = 0.4;
    let clipHits = 0;
    let Lsum = 0;

    // policy clipped surrogate grads
    for (let i = 0; i < actions.length; i++) {
      const a = actions[i];
      const Ahat = adv[i];
      const p = softmax(S.logits);
      const rho = Math.exp(Math.log(Math.max(p[a], 1e-12)) - oldLogP[i]);
      const unclipped = rho * Ahat;
      const clipped = clip(rho, 1 - eps, 1 + eps) * Ahat;
      const term = Math.min(unclipped, clipped);
      const binds = Math.abs(term - unclipped) > 1e-12;
      if (binds) clipHits += 1;
      Lsum += term;

      if (!binds && Math.abs(Ahat) > 1e-12) {
        for (let j = 0; j < ACTIONS.length; j++) {
          const score = (j === a ? 1 : 0) - p[j];
          S.logits[j] += lr * rho * score * Ahat;
        }
      }
    }

    // soft pull toward reference (token/action-level KL proxy)
    const p = softmax(S.logits);
    const pref = softmax(S.refLogits);
    for (let j = 0; j < ACTIONS.length; j++) {
      // gradient of KL(ref || π) roughly pulls π toward ref
      S.logits[j] -= lr * beta * (p[j] - pref[j]);
    }

    const clipFrac = clipHits / actions.length;
    set("grpoClipFrac", (100 * clipFrac).toFixed(1) + "%");
    set("grpoKL", kl(pref, softmax(S.logits)).toFixed(4));
    set("grpoEnt", entropy(softmax(S.logits)).toFixed(3));

    const el = document.getElementById("grpoTrace");
    if (el) {
      el.textContent =
        `GRPO update · ε=${eps.toFixed(2)} · β=${beta.toFixed(3)}\n` +
        `Mean L^CLIP term ≈ ${(Lsum / actions.length).toFixed(4)}\n` +
        `Clip fraction ${(100 * clipFrac).toFixed(1)}%\n` +
        (std < 1e-8
          ? `std was ~0 — surrogate flat; only KL moved π.\n`
          : `Policy should drift toward high-R actions (esp. B).\n`) +
        `Compare to PPO: same clip, but Â came from the group — no critic.`;
    }
    renderBars();
  }

  function reset() {
    S.logits = ACTIONS.map(() => 0);
    S.refLogits = ACTIONS.map(() => 0);
    S.group = null;
    set("grpoMean", "—");
    set("grpoStd", "—");
    set("grpoClipFrac", "—");
    const el = document.getElementById("grpoTrace");
    if (el) {
      el.textContent =
        "One prompt, four discrete “completions” A–D with fixed rewards. Sample a group, form Â from mean/std, then GRPO-step.";
    }
    renderGroup();
    renderBars();
  }

  document.getElementById("grpoG")?.addEventListener("input", (e) => {
    S.G = Number(e.target.value);
    set("grpoGL", String(S.G));
  });
  document.getElementById("grpoEps")?.addEventListener("input", (e) => {
    S.eps = Number(e.target.value);
    set("grpoEpsL", S.eps.toFixed(2));
  });
  document.getElementById("grpoBeta")?.addEventListener("input", (e) => {
    S.beta = Number(e.target.value);
    set("grpoBetaL", S.beta.toFixed(3));
  });

  document.getElementById("grpoSample")?.addEventListener("click", sampleGroup);
  document.getElementById("grpoStep")?.addEventListener("click", grpoStep);
  document.getElementById("grpoReset")?.addEventListener("click", reset);

  reset();
})();
