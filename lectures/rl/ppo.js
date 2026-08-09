/* Pearl — Ch 08: PPO clipped-surrogate laboratory */

(() => {
  "use strict";

  const N = 4;
  const GOAL = { r: 3, c: 3 };
  const ACTIONS = [
    { name: "↑", dr: -1, dc: 0 },
    { name: "→", dr: 0, dc: 1 },
    { name: "↓", dr: 1, dc: 0 },
    { name: "←", dr: 0, dc: -1 },
  ];
  const A = ACTIONS.length;
  const BATCH_EPS = 16;

  const S = {
    logits: null,
    oldLogits: null,
    eps: 0.2,
    gamma: 0.95,
    epochs: 4,
    batch: null,
    clipFrac: 0,
    meanKL: 0,
    lastL: 0,
  };

  function isGoal(r, c) {
    return r === GOAL.r && c === GOAL.c;
  }

  function emptyLogits() {
    return Array.from({ length: N }, (_, r) =>
      Array.from({ length: N }, (_, c) =>
        ACTIONS.map((a) => {
          let h = 0;
          if (a.name === "↓" && r < GOAL.r) h = 0.25;
          if (a.name === "→" && c < GOAL.c) h = 0.25;
          return h;
        })
      )
    );
  }

  function copyLogits(L) {
    return L.map((row) => row.map((qs) => qs.slice()));
  }

  function softmax(logits) {
    const m = Math.max(...logits);
    const ex = logits.map((z) => Math.exp(z - m));
    const z = ex.reduce((a, b) => a + b, 0);
    return ex.map((e) => e / z);
  }

  function piAt(logits, r, c) {
    return softmax(logits[r][c]);
  }

  function sample(logits, r, c) {
    const p = piAt(logits, r, c);
    let u = Math.random();
    for (let i = 0; i < p.length; i++) {
      u -= p[i];
      if (u <= 0) return i;
    }
    return p.length - 1;
  }

  function move(r, c, ai) {
    const a = ACTIONS[ai];
    return {
      r: Math.max(0, Math.min(N - 1, r + a.dr)),
      c: Math.max(0, Math.min(N - 1, c + a.dc)),
    };
  }

  function step(r, c, ai) {
    if (isGoal(r, c)) return { r, c, reward: 0, done: true };
    const n = move(r, c, ai);
    if (isGoal(n.r, n.c)) return { r: n.r, c: n.c, reward: 1, done: true };
    return { r: n.r, c: n.c, reward: 0, done: false };
  }

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function clip(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
  }

  /** Piecewise L^CLIP contribution for one sample. */
  function clippedTerm(rho, adv, eps) {
    const unclipped = rho * adv;
    const clipped = clip(rho, 1 - eps, 1 + eps) * adv;
    const term = Math.min(unclipped, clipped);
    const binds = Math.abs(term - unclipped) > 1e-12;
    return { unclipped, clipped, term, binds };
  }

  // ---------- Clip playground (1D ρ × A) ----------
  function renderPlayground() {
    const rhoEl = document.getElementById("ppoRho");
    const advEl = document.getElementById("ppoAdv");
    const epsEl = document.getElementById("ppoEpsPlay");
    if (!rhoEl || !advEl || !epsEl) return;

    const rho = Number(rhoEl.value);
    const adv = Number(advEl.value);
    const eps = Number(epsEl.value);
    const { unclipped, clipped, term, binds } = clippedTerm(rho, adv, eps);

    set("ppoRhoL", rho.toFixed(2));
    set("ppoAdvL", adv.toFixed(2));
    set("ppoEpsPlayL", eps.toFixed(2));
    set("ppoUnc", unclipped.toFixed(4));
    set("ppoClp", clipped.toFixed(4));
    set("ppoMin", term.toFixed(4));
    set("ppoBind", binds ? "YES — clip binds" : "no — same as CPI");

    const canvas = document.getElementById("ppoClipCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // axes
    ctx.strokeStyle = "rgba(201,137,74,0.35)";
    ctx.beginPath();
    ctx.moveTo(40, H / 2);
    ctx.lineTo(W - 10, H / 2);
    ctx.moveTo(40, 10);
    ctx.lineTo(40, H - 10);
    ctx.stroke();

    const rhoMin = 0;
    const rhoMax = 2;
    const xOf = (r) => 40 + ((r - rhoMin) / (rhoMax - rhoMin)) * (W - 50);
    const yScale = 28;
    const yOf = (v) => H / 2 - v * yScale;

    // trust band
    ctx.fillStyle = "rgba(143,173,154,0.15)";
    ctx.fillRect(xOf(1 - eps), 10, xOf(1 + eps) - xOf(1 - eps), H - 20);

    // unclipped line ρA
    ctx.strokeStyle = "rgba(168,90,74,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let r = rhoMin; r <= rhoMax; r += 0.02) {
      const y = yOf(r * adv);
      if (r === rhoMin) ctx.moveTo(xOf(r), y);
      else ctx.lineTo(xOf(r), y);
    }
    ctx.stroke();

    // clipped objective min(ρA, clip(ρ)A)
    ctx.strokeStyle = "rgba(224,168,106,0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    let first = true;
    for (let r = rhoMin; r <= rhoMax; r += 0.02) {
      const y = yOf(clippedTerm(r, adv, eps).term);
      if (first) {
        ctx.moveTo(xOf(r), y);
        first = false;
      } else ctx.lineTo(xOf(r), y);
    }
    ctx.stroke();

    // current ρ marker
    ctx.fillStyle = "#e0a86a";
    ctx.beginPath();
    ctx.arc(xOf(rho), yOf(term), 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(247,239,227,0.55)";
    ctx.font = "11px IBM Plex Mono, monospace";
    ctx.fillText("ρ", W - 18, H / 2 + 14);
    ctx.fillText("L", 12, 18);
    ctx.fillText("band", xOf(1) - 12, H - 14);
  }

  // ---------- Gridworld PPO ----------
  function collectBatch() {
    const states = [];
    const actions = [];
    const adv = [];
    const oldLogP = [];
    const Gs = [];

    for (let ep = 0; ep < BATCH_EPS; ep++) {
      let r = 0;
      let c = 0;
      const traj = [];
      let Gacc = 0;
      let disc = 1;
      for (let t = 0; t < 40; t++) {
        if (isGoal(r, c)) break;
        const a = sample(S.logits, r, c);
        const p = piAt(S.logits, r, c);
        const n = step(r, c, a);
        traj.push({ r, c, a, logp: Math.log(Math.max(p[a], 1e-12)), reward: n.reward });
        Gacc += disc * n.reward;
        disc *= S.gamma;
        r = n.r;
        c = n.c;
        if (n.done) break;
      }
      Gs.push(Gacc);
      // MC returns as advantage proxy (V=0 baseline for demo clarity)
      let Gt = 0;
      for (let t = traj.length - 1; t >= 0; t--) {
        Gt = traj[t].reward + S.gamma * Gt;
        states.push({ r: traj[t].r, c: traj[t].c });
        actions.push(traj[t].a);
        oldLogP.push(traj[t].logp);
        adv.push(Gt);
      }
    }

    const mean = adv.reduce((a, b) => a + b, 0) / Math.max(adv.length, 1);
    const std =
      Math.sqrt(adv.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(adv.length, 1)) +
      1e-8;
    for (let i = 0; i < adv.length; i++) adv[i] = (adv[i] - mean) / std;

    S.oldLogits = copyLogits(S.logits);
    S.batch = { states, actions, adv, oldLogP, avgG: Gs.reduce((a, b) => a + b, 0) / Gs.length };
    set("ppoBatchN", String(BATCH_EPS));
    set("ppoG", S.batch.avgG.toFixed(3));
    set("ppoClipFrac", "—");
    set("ppoKL", "—");
    set("ppoL", "—");

    const el = document.getElementById("ppoTrace");
    if (el) {
      el.textContent =
        `Collected ${BATCH_EPS} episodes · ${states.length} transitions\n` +
        `Avg G₀=${S.batch.avgG.toFixed(4)} · Â = MC return (normalized)\n` +
        `Frozen π_old for ratios. Run PPO epochs to maximize L^CLIP.`;
    }
    renderGrid();
  }

  function meanKL() {
    if (!S.batch || !S.oldLogits) return 0;
    let s = 0;
    for (let i = 0; i < S.batch.states.length; i++) {
      const { r, c } = S.batch.states[i];
      const p = piAt(S.oldLogits, r, c);
      const q = piAt(S.logits, r, c);
      for (let j = 0; j < A; j++) {
        const pj = Math.max(p[j], 1e-12);
        const qj = Math.max(q[j], 1e-12);
        s += pj * Math.log(pj / qj);
      }
    }
    return s / S.batch.states.length;
  }

  function ppoEpoch() {
    if (!S.batch) {
      const el = document.getElementById("ppoTrace");
      if (el) el.textContent = "Collect a batch first.";
      return;
    }
    const eps = S.eps;
    const lr = 0.35;
    let clipHits = 0;
    let Lsum = 0;

    // one pass over all samples (demo “epoch”)
    for (let i = 0; i < S.batch.states.length; i++) {
      const { r, c } = S.batch.states[i];
      const a = S.batch.actions[i];
      const Ahat = S.batch.adv[i];
      const p = piAt(S.logits, r, c);
      const rho = Math.exp(Math.log(Math.max(p[a], 1e-12)) - S.batch.oldLogP[i]);
      const { term, binds } = clippedTerm(rho, Ahat, eps);
      if (binds) clipHits += 1;
      Lsum += term;

      // gradient of min only when unclipped is the active (pessimistic) piece AND not binding
      // When binds, ∂/∂θ of objective w.r.t. further harmful move is 0 for this sample.
      if (!binds) {
        for (let j = 0; j < A; j++) {
          const score = (j === a ? 1 : 0) - p[j];
          // ∇ (ρ A) = ρ ∇logπ A
          S.logits[r][c][j] += lr * rho * score * Ahat;
        }
      }
    }

    S.clipFrac = clipHits / S.batch.states.length;
    S.meanKL = meanKL();
    S.lastL = Lsum / S.batch.states.length;

    set("ppoClipFrac", (100 * S.clipFrac).toFixed(1) + "%");
    set("ppoKL", S.meanKL.toFixed(4));
    set("ppoL", S.lastL.toFixed(4));

    const el = document.getElementById("ppoTrace");
    if (el) {
      el.textContent =
        `One PPO epoch · ε=${eps.toFixed(2)}\n` +
        `L^CLIP ≈ ${S.lastL.toFixed(4)}  ·  clip fraction ${((100 * S.clipFrac).toFixed(1))}%\n` +
        `Approx mean KL(π_old‖π) = ${S.meanKL.toFixed(5)}\n` +
        (S.clipFrac > 0.35
          ? "High clip fraction — many samples already outside the trust band; further epochs add little.\n"
          : "Clip mostly inactive — ratios still near 1; more epochs can still move π.\n") +
        `Compare: without clipping, the same step would keep pushing ρ even when extreme.`;
    }
    renderGrid();
  }

  function runManyEpochs() {
    for (let k = 0; k < S.epochs; k++) ppoEpoch();
  }

  function vanillaUnclippedStep() {
    if (!S.batch) return;
    const lr = 0.35;
    let Lsum = 0;
    for (let i = 0; i < S.batch.states.length; i++) {
      const { r, c } = S.batch.states[i];
      const a = S.batch.actions[i];
      const Ahat = S.batch.adv[i];
      const p = piAt(S.logits, r, c);
      const rho = Math.exp(Math.log(Math.max(p[a], 1e-12)) - S.batch.oldLogP[i]);
      Lsum += rho * Ahat;
      for (let j = 0; j < A; j++) {
        const score = (j === a ? 1 : 0) - p[j];
        S.logits[r][c][j] += lr * rho * score * Ahat;
      }
    }
    S.meanKL = meanKL();
    S.lastL = Lsum / S.batch.states.length;
    S.clipFrac = 0;
    set("ppoClipFrac", "n/a (unclipped)");
    set("ppoKL", S.meanKL.toFixed(4));
    set("ppoL", S.lastL.toFixed(4));
    const el = document.getElementById("ppoTrace");
    if (el) {
      el.textContent =
        `Unclipped CPI step (no min/clip)\n` +
        `Surrogate L^CPI ≈ ${S.lastL.toFixed(4)} · KL=${S.meanKL.toFixed(5)}\n` +
        `Lesson: same data + same LR, but KL often grows faster without the clip.`;
    }
    renderGrid();
  }

  function renderGrid() {
    const el = document.getElementById("ppoGrid");
    if (!el) return;
    el.className = "dp-grid";
    el.innerHTML = "";
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = document.createElement("div");
        cell.className = "dp-cell";
        if (isGoal(r, c)) {
          cell.classList.add("goal");
          cell.innerHTML = `<span class="dp-a">G</span>`;
        } else {
          const p = piAt(S.logits, r, c);
          let best = 0;
          for (let i = 1; i < p.length; i++) if (p[i] > p[best]) best = i;
          const conf = p[best];
          cell.style.background = `rgba(201,137,74,${(0.12 + 0.55 * conf).toFixed(3)})`;
          cell.innerHTML = `<span class="dp-a">${ACTIONS[best].name}</span><span class="dp-v">π=${conf.toFixed(2)}</span>`;
        }
        el.appendChild(cell);
      }
    }
  }

  function reset() {
    S.logits = emptyLogits();
    S.oldLogits = null;
    S.batch = null;
    set("ppoBatchN", "0");
    set("ppoG", "—");
    set("ppoClipFrac", "—");
    set("ppoKL", "—");
    set("ppoL", "—");
    const el = document.getElementById("ppoTrace");
    if (el) {
      el.textContent =
        "Collect batch under π, then run clipped PPO epochs. Use the playground above to see when the clip binds for a single (ρ, Â) pair.";
    }
    renderGrid();
    renderPlayground();
  }

  document.getElementById("ppoRho")?.addEventListener("input", renderPlayground);
  document.getElementById("ppoAdv")?.addEventListener("input", renderPlayground);
  document.getElementById("ppoEpsPlay")?.addEventListener("input", renderPlayground);

  document.getElementById("ppoEps")?.addEventListener("input", (e) => {
    S.eps = Number(e.target.value);
    set("ppoEpsL", S.eps.toFixed(2));
  });
  document.getElementById("ppoGamma")?.addEventListener("input", (e) => {
    S.gamma = Number(e.target.value);
    set("ppoGammaL", S.gamma.toFixed(2));
  });
  document.getElementById("ppoEpochs")?.addEventListener("input", (e) => {
    S.epochs = Number(e.target.value);
    set("ppoEpochsL", String(S.epochs));
  });

  document.getElementById("ppoRoll")?.addEventListener("click", collectBatch);
  document.getElementById("ppoOnce")?.addEventListener("click", ppoEpoch);
  document.getElementById("ppoMany")?.addEventListener("click", runManyEpochs);
  document.getElementById("ppoUnclip")?.addEventListener("click", vanillaUnclippedStep);
  document.getElementById("ppoReset")?.addEventListener("click", reset);

  reset();
})();
