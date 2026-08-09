/* Pearl — Ch 07: tabular TRPO-style trust region lab */

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
  const BATCH_EPS = 20;

  const S = {
    logits: null,
    delta: 0.01,
    gamma: 0.95,
    batch: null, // {states, actions, adv, oldPi, returns}
  };

  function isGoal(r, c) {
    return r === GOAL.r && c === GOAL.c;
  }

  function emptyLogits() {
    // slight bias toward down/right to speed demos
    return Array.from({ length: N }, (_, r) =>
      Array.from({ length: N }, (_, c) =>
        ACTIONS.map((a) => {
          let h = 0;
          if (a.name === "↓" && r < GOAL.r) h = 0.3;
          if (a.name === "→" && c < GOAL.c) h = 0.3;
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

  function klCat(p, q) {
    let s = 0;
    for (let i = 0; i < p.length; i++) {
      const pi = Math.max(p[i], 1e-12);
      const qi = Math.max(q[i], 1e-12);
      s += pi * Math.log(pi / qi);
    }
    return s;
  }

  function meanKLOnBatch(oldL, newL, batch) {
    let sum = 0;
    for (let i = 0; i < batch.states.length; i++) {
      const { r, c } = batch.states[i];
      sum += klCat(piAt(oldL, r, c), piAt(newL, r, c));
    }
    return batch.states.length ? sum / batch.states.length : 0;
  }

  /** Surrogate L(θ) = E[ (π_θ/π_old) A ] using batch from old policy */
  function surrogate(logits, batch) {
    let sum = 0;
    for (let i = 0; i < batch.states.length; i++) {
      const { r, c } = batch.states[i];
      const a = batch.actions[i];
      const pNew = piAt(logits, r, c)[a];
      const pOld = Math.max(batch.oldPi[i], 1e-12);
      sum += (pNew / pOld) * batch.adv[i];
    }
    return sum / batch.states.length;
  }

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function ensureStyles() {
    /* shared .dp-grid rules live in styles.css */
  }

  function render() {
    ensureStyles();
    const el = document.getElementById("trpoGrid");
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
          cell.style.background = `rgba(201,137,74,${(0.1 + 0.55 * p[best]).toFixed(3)})`;
          cell.innerHTML = `<span class="dp-a">${ACTIONS[best].name}</span><span class="dp-v">π=${p[best].toFixed(2)}</span>`;
        }
        el.appendChild(cell);
      }
    }
  }

  function rolloutEpisode(logits) {
    let r = 0;
    let c = 0;
    const traj = [];
    for (let t = 0; t < 64; t++) {
      if (isGoal(r, c)) break;
      const a = sample(logits, r, c);
      const p = piAt(logits, r, c)[a];
      const out = step(r, c, a);
      traj.push({ r, c, a, p, reward: out.reward, done: out.done });
      r = out.r;
      c = out.c;
      if (out.done) break;
    }
    // MC returns
    const T = traj.length;
    const G = Array(T).fill(0);
    let acc = 0;
    for (let t = T - 1; t >= 0; t--) {
      acc = traj[t].reward + S.gamma * acc;
      G[t] = acc;
    }
    return { traj, G, G0: T ? G[0] : 0 };
  }

  function collectBatch() {
    const states = [];
    const actions = [];
    const adv = [];
    const oldPi = [];
    const Gs = [];
    const retSum = {};
    const retCnt = {};
    const episodes = [];

    for (let e = 0; e < BATCH_EPS; e++) {
      const { traj, G, G0 } = rolloutEpisode(S.logits);
      Gs.push(G0);
      episodes.push({ traj, G });
      for (let t = 0; t < traj.length; t++) {
        const key = `${traj[t].r},${traj[t].c}`;
        retSum[key] = (retSum[key] || 0) + G[t];
        retCnt[key] = (retCnt[key] || 0) + 1;
      }
    }

    for (const { traj, G } of episodes) {
      for (let t = 0; t < traj.length; t++) {
        const { r, c, a, p } = traj[t];
        const key = `${r},${c}`;
        const v = retSum[key] / retCnt[key];
        states.push({ r, c });
        actions.push(a);
        oldPi.push(p);
        adv.push(G[t] - v);
      }
    }

    // normalize advantages; report mean |Â| before norm (mean Â is ~0 by construction)
    const meanAbs =
      adv.reduce((a, b) => a + Math.abs(b), 0) / Math.max(adv.length, 1);
    const mean = adv.reduce((a, b) => a + b, 0) / Math.max(adv.length, 1);
    const std =
      Math.sqrt(
        adv.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(adv.length, 1)
      ) + 1e-8;
    for (let i = 0; i < adv.length; i++) adv[i] = (adv[i] - mean) / std;

    S.batch = {
      states,
      actions,
      adv,
      oldPi,
      oldLogits: copyLogits(S.logits),
      avgG: Gs.reduce((a, b) => a + b, 0) / Gs.length,
    };

    set("trpoBatchN", String(BATCH_EPS));
    set("trpoAdv", meanAbs.toFixed(3));
    set("trpoG", S.batch.avgG.toFixed(3));
    set("trpoL", "—");
    set("trpoKL", "—");
    set("trpoLS", "—");

    const el = document.getElementById("trpoTrace");
    if (el) {
      el.textContent =
        `Collected ${BATCH_EPS} episodes · ${states.length} transitions\n` +
        `Avg G₀=${S.batch.avgG.toFixed(4)} · mean|Â|=${meanAbs.toFixed(3)} (then mean/std normalized)\n` +
        `Surrogate L(θ)=E[(π_θ/π_old) Â] ready at θ_old.\n` +
        `Next: TRPO-style step (Fisher-scaled + line search) or vanilla PG with the same η.`;
    }
    render();
  }

  /**
   * Gradient of L w.r.t. logits at θ_old.
   * At θ=θ_old, r=1, ∇_{h} L uses ∇ logπ · A  (same as PG).
   * For diagonal Fisher: F_ii ≈ π_i (for softmax in probability coords) —
   * we work in logit space: F ≈ diag(π) - ππᵀ locally; use diag(π) damping.
   */
  function policyGradientLogits(batch, logits) {
    const g = Array.from({ length: N }, () =>
      Array.from({ length: N }, () => ACTIONS.map(() => 0))
    );
    const fisherDiag = Array.from({ length: N }, () =>
      Array.from({ length: N }, () => ACTIONS.map(() => 1e-6))
    );

    for (let i = 0; i < batch.states.length; i++) {
      const { r, c } = batch.states[i];
      const a = batch.actions[i];
      const Ahat = batch.adv[i];
      const p = piAt(logits, r, c);
      // score function ∇_h log π(a) = 1_a - π
      for (let j = 0; j < A; j++) {
        const score = (j === a ? 1 : 0) - p[j];
        g[r][c][j] += score * Ahat;
        // diagonal Fisher accum: E[score_j^2] ≈ rough; use π_j(1-π_j) style
        fisherDiag[r][c][j] += p[j] * (1 - p[j]);
      }
    }
    const n = batch.states.length;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        for (let j = 0; j < A; j++) {
          g[r][c][j] /= n;
          fisherDiag[r][c][j] /= n;
          fisherDiag[r][c][j] = Math.max(fisherDiag[r][c][j], 1e-5);
        }
      }
    }
    return { g, fisherDiag };
  }

  function applyStep(logits, stepDir, scale) {
    const out = copyLogits(logits);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (isGoal(r, c)) continue;
        for (let j = 0; j < A; j++) {
          out[r][c][j] += scale * stepDir[r][c][j];
        }
      }
    }
    return out;
  }

  function naturalDirection(g, fisherDiag) {
    const x = Array.from({ length: N }, () =>
      Array.from({ length: N }, () => ACTIONS.map(() => 0))
    );
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        for (let j = 0; j < A; j++) {
          x[r][c][j] = g[r][c][j] / fisherDiag[r][c][j];
        }
      }
    }
    return x;
  }

  /** Approximate ½ xᵀ F x using diagonal F */
  function quadForm(x, fisherDiag) {
    let s = 0;
    let n = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (isGoal(r, c)) continue;
        for (let j = 0; j < A; j++) {
          s += fisherDiag[r][c][j] * x[r][c][j] * x[r][c][j];
          n += 1;
        }
      }
    }
    return 0.5 * s; // already mean-ish via fisher accum; OK for scaling
  }

  function trpoStep() {
    if (!S.batch) {
      const el = document.getElementById("trpoTrace");
      if (el) el.textContent = "Collect a batch first.";
      return;
    }
    const batch = S.batch;
    const oldL = batch.oldLogits;
    const L0 = surrogate(oldL, batch);
    const { g, fisherDiag } = policyGradientLogits(batch, oldL);
    let x = naturalDirection(g, fisherDiag);

    // rescale so quadratic KL proxy ≈ δ
    const q2 = quadForm(x, fisherDiag) + 1e-12;
    const eta = Math.sqrt(S.delta / q2);

    // Line search
    const beta = 0.8;
    let accepted = null;
    let jAcc = -1;
    let lastKL = 0;
    let lastL = L0;
    const lines = [];
    lines.push(`L(θ_old)=${L0.toFixed(5)} · δ=${S.delta} · η₀=${eta.toFixed(4)} (Fisher-diag scale)`);

    for (let j = 0; j < 15; j++) {
      const stepScale = eta * Math.pow(beta, j);
      const cand = applyStep(oldL, x, stepScale);
      const kl = meanKLOnBatch(oldL, cand, batch);
      const L = surrogate(cand, batch);
      lastKL = kl;
      lastL = L;
      lines.push(
        `  j=${j} scale=${stepScale.toFixed(4)}  KL=${kl.toFixed(5)}  L=${L.toFixed(5)}  ΔL=${(L - L0).toFixed(5)}`
      );
      if (kl <= S.delta && L > L0) {
        accepted = cand;
        jAcc = j;
        break;
      }
    }

    if (accepted) {
      S.logits = accepted;
      set("trpoLS", String(jAcc));
      set("trpoKL", lastKL.toFixed(5));
      set("trpoL", (lastL - L0).toFixed(5));
      lines.push(`ACCEPTED at backtrack j=${jAcc}. Trust region satisfied.`);
    } else {
      set("trpoLS", "reject");
      set("trpoKL", lastKL.toFixed(5));
      set("trpoL", (lastL - L0).toFixed(5));
      lines.push("REJECTED — no step met KL≤δ and L↑. Policy unchanged.");
    }

    // Invalidate batch (on-policy: must recollect)
    S.batch = null;
    set("trpoBatchN", "0 (stale)");

    const el = document.getElementById("trpoTrace");
    if (el) el.textContent = lines.join("\n") + "\n\nCollect a fresh batch before the next update.";
    render();
  }

  function vanillaStep() {
    if (!S.batch) {
      const el = document.getElementById("trpoTrace");
      if (el) el.textContent = "Collect a batch first.";
      return;
    }
    const batch = S.batch;
    const oldL = batch.oldLogits;
    const L0 = surrogate(oldL, batch);
    const { g, fisherDiag } = policyGradientLogits(batch, oldL);

    // Same η TRPO would use for the natural direction — only difference is
    // Euclidean g vs F⁻¹g (Fisher preconditioning).
    const xNat = naturalDirection(g, fisherDiag);
    const q2 = quadForm(xNat, fisherDiag) + 1e-12;
    const eta = Math.sqrt(S.delta / q2);

    const candNat = applyStep(oldL, xNat, eta);
    const candEu = applyStep(oldL, g, eta);
    const klNat = meanKLOnBatch(oldL, candNat, batch);
    const klEu = meanKLOnBatch(oldL, candEu, batch);
    const LEu = surrogate(candEu, batch);

    // Apply the Euclidean step (the comparison condition under test)
    S.logits = candEu;
    S.batch = null;

    set("trpoLS", "none");
    set("trpoKL", klEu.toFixed(5));
    set("trpoL", (LEu - L0).toFixed(5));
    set("trpoBatchN", "0 (stale)");

    const el = document.getElementById("trpoTrace");
    if (el) {
      el.textContent =
        `Vanilla PG vs natural — same η=${eta.toFixed(4)} (sized so ½xᵀFx≈δ for F⁻¹g)\n` +
        `  Natural direction  KL=${klNat.toFixed(5)}  (fills ~trust region)\n` +
        `  Euclidean g        KL=${klEu.toFixed(5)}  (applied; no Fisher stretch)\n` +
        `L(θ_old)=${L0.toFixed(5)} → L_eu=${LEu.toFixed(5)}  ΔL=${(LEu - L0).toFixed(5)}\n` +
        `Lesson: identical step-size scalar; without F⁻¹ the update barely moves in KL.\n` +
        `TRPO-style step adds line search on top of the natural direction.\n` +
        `Collect a fresh batch to continue.`;
    }
    render();
  }

  function reset() {
    S.logits = emptyLogits();
    S.batch = null;
    set("trpoBatchN", "0");
    set("trpoAdv", "—");
    set("trpoL", "—");
    set("trpoKL", "—");
    set("trpoLS", "—");
    set("trpoG", "—");
    const el = document.getElementById("trpoTrace");
    if (el) {
      el.textContent =
        "Policy reset. Workflow: Collect batch → TRPO-style step (watch backtracking) → compare Vanilla PG step KL.";
    }
    render();
  }

  document.getElementById("trpoDelta")?.addEventListener("input", (e) => {
    S.delta = Number(e.target.value);
    set("trpoDeltaL", S.delta.toFixed(3));
  });
  document.getElementById("trpoGamma")?.addEventListener("input", (e) => {
    S.gamma = Number(e.target.value);
    const lab = document.getElementById("trpoGammaL");
    if (lab) lab.textContent = S.gamma.toFixed(2);
  });

  document.getElementById("trpoRoll")?.addEventListener("click", collectBatch);
  document.getElementById("trpoTrust")?.addEventListener("click", trpoStep);
  document.getElementById("trpoVanilla")?.addEventListener("click", vanillaStep);
  document.getElementById("trpoReset")?.addEventListener("click", reset);

  set("trpoDeltaL", S.delta.toFixed(3));
  reset();
})();
