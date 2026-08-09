/* Pearl — Ch 06: softmax REINFORCE / baseline / actor-critic */

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

  const S = {
    mode: "reinforce", // reinforce | baseline | ac
    logits: null, // [r][c][a]
    V: null,
    alpha: 0.25,
    beta: 0.35,
    gamma: 0.95,
    episodes: 0,
    returns: [],
    lastDlog: null,
  };

  function isGoal(r, c) {
    return r === GOAL.r && c === GOAL.c;
  }

  function emptyLogits() {
    return Array.from({ length: N }, () =>
      Array.from({ length: N }, () => ACTIONS.map(() => 0))
    );
  }

  function emptyV() {
    return Array.from({ length: N }, () => Array(N).fill(0));
  }

  function softmax(logits) {
    const m = Math.max(...logits);
    const ex = logits.map((z) => Math.exp(z - m));
    const z = ex.reduce((a, b) => a + b, 0);
    return ex.map((e) => e / z);
  }

  function pi(r, c) {
    return softmax(S.logits[r][c]);
  }

  function sampleAction(r, c) {
    const p = pi(r, c);
    let u = Math.random();
    for (let i = 0; i < p.length; i++) {
      u -= p[i];
      if (u <= 0) return i;
    }
    return p.length - 1;
  }

  function clipMove(r, c, ai) {
    const a = ACTIONS[ai];
    return {
      r: Math.max(0, Math.min(N - 1, r + a.dr)),
      c: Math.max(0, Math.min(N - 1, c + a.dc)),
    };
  }

  function step(r, c, ai) {
    if (isGoal(r, c)) return { r, c, reward: 0, done: true };
    const n = clipMove(r, c, ai);
    if (isGoal(n.r, n.c)) return { r: n.r, c: n.c, reward: 1, done: true };
    return { r: n.r, c: n.c, reward: 0, done: false };
  }

  /** Softmax score-function: ∇_h log π(a) = 1_a - π */
  function applyLogitGrad(r, c, a, weight) {
    const p = pi(r, c);
    let mag = 0;
    for (let i = 0; i < ACTIONS.length; i++) {
      const g = ((i === a ? 1 : 0) - p[i]) * weight * S.alpha;
      S.logits[r][c][i] += g;
      mag += Math.abs(g);
    }
    return mag;
  }

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function ensureStyles() {
    /* shared rules in styles.css */
  }

  function render() {
    ensureStyles();
    const el = document.getElementById("pgGrid");
    if (!el) return;
    el.className = "dp-grid";
    el.innerHTML = "";
    const showV = S.mode !== "reinforce";
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = document.createElement("div");
        cell.className = "dp-cell";
        if (isGoal(r, c)) {
          cell.classList.add("goal");
          cell.innerHTML = showV
            ? `<span class="dp-a">G</span><span class="dp-v">V=${S.V[r][c].toFixed(2)}</span>`
            : `<span class="dp-a">G</span>`;
        } else {
          const p = pi(r, c);
          let best = 0;
          for (let i = 1; i < p.length; i++) if (p[i] > p[best]) best = i;
          // uniform / untrained: all equal
          const uniform = p.every((x) => Math.abs(x - p[0]) < 1e-9);
          const conf = p[best];
          cell.style.background = `rgba(201,137,74,${(0.1 + 0.55 * conf).toFixed(3)})`;
          const arrow = uniform ? "·" : ACTIONS[best].name;
          const sub = showV
            ? `V=${S.V[r][c].toFixed(2)} π=${conf.toFixed(2)}`
            : `π=${conf.toFixed(2)}`;
          cell.innerHTML = `<span class="dp-a">${arrow}</span><span class="dp-v">${sub}</span>`;
        }
        el.appendChild(cell);
      }
    }
    set("pgEpN", String(S.episodes));
    const last = S.returns[S.returns.length - 1];
    set("pgLastG", last === undefined ? "—" : last.toFixed(3));
    const w = S.returns.slice(-20);
    set(
      "pgAvgG",
      w.length ? (w.reduce((a, b) => a + b, 0) / w.length).toFixed(3) : "—"
    );
    set(
      "pgDlog",
      S.lastDlog === null || S.lastDlog === undefined
        ? "—"
        : S.lastDlog.toFixed(3)
    );
  }

  function runEpisode(log) {
    // Rollout from (0,0)
    let r = 0;
    let c = 0;
    const traj = [];
    let steps = 0;
    while (steps < 64) {
      if (isGoal(r, c)) break;
      const a = sampleAction(r, c);
      const out = step(r, c, a);
      traj.push({ r, c, a, reward: out.reward, nr: out.r, nc: out.c, done: out.done });
      r = out.r;
      c = out.c;
      steps += 1;
      if (out.done) break;
    }

    // Returns G_t from each step
    const T = traj.length;
    const G = Array(T).fill(0);
    let acc = 0;
    for (let t = T - 1; t >= 0; t--) {
      acc = traj[t].reward + S.gamma * acc;
      G[t] = acc;
    }

    let dlogSum = 0;
    const lines = [];

    if (S.mode === "ac") {
      // One-step actor-critic along trajectory
      for (let t = 0; t < T; t++) {
        const { r: sr, c: sc, a, reward, nr, nc, done } = traj[t];
        const vNext = done || isGoal(nr, nc) ? 0 : S.V[nr][nc];
        const delta = reward + S.gamma * vNext - S.V[sr][sc];
        dlogSum += applyLogitGrad(sr, sc, a, delta);
        S.V[sr][sc] += S.beta * delta;
        if (t < 3) {
          lines.push(
            `t=${t} (${sr},${sc}) ${ACTIONS[a].name} r=${reward} δ=${delta.toFixed(3)} ` +
              `V←${S.V[sr][sc].toFixed(3)}`
          );
        }
      }
    } else {
      // REINFORCE or baseline: update after full episode
      for (let t = 0; t < T; t++) {
        const { r: sr, c: sc, a } = traj[t];
        let w = G[t];
        if (S.mode === "baseline") {
          w = G[t] - S.V[sr][sc];
        }
        dlogSum += applyLogitGrad(sr, sc, a, w);
        if (S.mode === "baseline") {
          S.V[sr][sc] += S.beta * (G[t] - S.V[sr][sc]);
        }
        if (t < 3) {
          lines.push(
            `t=${t} (${sr},${sc}) ${ACTIONS[a].name} G=${G[t].toFixed(3)}` +
              (S.mode === "baseline" ? ` A=${w.toFixed(3)}` : "") +
              ` ∇logπ·w applied`
          );
        }
      }
    }

    const G0 = T ? G[0] : 0;
    S.episodes += 1;
    S.returns.push(G0);
    S.lastDlog = dlogSum;

    if (log) {
      const el = document.getElementById("pgTrace");
      if (el) {
        const name =
          S.mode === "reinforce"
            ? "REINFORCE · weight = G_t"
            : S.mode === "baseline"
              ? "REINFORCE + baseline · weight = G_t − V(s)"
              : "Actor–Critic · weight = δ_t = r+γV(s′)−V(s)";
        el.textContent =
          `Episode ${S.episodes} · ${name}\n` +
          `Steps=${T}  G₀=${G0.toFixed(4)}  Σ|Δlogits|≈${dlogSum.toFixed(3)}\n` +
          `Identity: ∇_h log π(a|s) = 1_a − π(·|s)\n\n` +
          (lines.join("\n") || "(empty traj)") +
          `\n\nGoal reaches yield G₀ near (1 or γ^k). Random walk starts near 0.`;
      }
    }
  }

  function setMode(mode) {
    S.mode = mode;
    const label = document.getElementById("pgModeL");
    const map = {
      reinforce: "Active: REINFORCE (MC return)",
      baseline: "Active: REINFORCE + V baseline",
      ac: "Active: one-step Actor–Critic",
    };
    if (label) label.textContent = map[mode];
    const ids = {
      reinforce: "pgModeR",
      baseline: "pgModeB",
      ac: "pgModeAC",
    };
    Object.entries(ids).forEach(([m, id]) => {
      const b = document.getElementById(id);
      if (!b) return;
      if (m === mode) b.classList.remove("ghost");
      else b.classList.add("ghost");
    });
    render();
  }

  function reset() {
    S.logits = emptyLogits();
    S.V = emptyV();
    S.episodes = 0;
    S.returns = [];
    S.lastDlog = null;
    const el = document.getElementById("pgTrace");
    if (el) {
      el.textContent =
        "Policy logits = 0 ⇒ uniform π. Run episodes; arrows concentrate toward the goal as reinforced paths succeed.";
    }
    render();
  }

  document.getElementById("pgModeR")?.addEventListener("click", () => setMode("reinforce"));
  document.getElementById("pgModeB")?.addEventListener("click", () => setMode("baseline"));
  document.getElementById("pgModeAC")?.addEventListener("click", () => setMode("ac"));

  const bind = (id, key, lab, fmt) => {
    const el = document.getElementById(id);
    el?.addEventListener("input", () => {
      S[key] = Number(el.value);
      const l = document.getElementById(lab);
      if (l) l.textContent = fmt(S[key]);
    });
  };
  bind("pgAlpha", "alpha", "pgAlphaL", (v) => v.toFixed(2));
  bind("pgBeta", "beta", "pgBetaL", (v) => v.toFixed(2));
  bind("pgGamma", "gamma", "pgGammaL", (v) => v.toFixed(2));

  document.getElementById("pgEp")?.addEventListener("click", () => {
    runEpisode(true);
    render();
  });
  document.getElementById("pgMany")?.addEventListener("click", () => {
    for (let i = 0; i < 49; i++) runEpisode(false);
    runEpisode(true);
    render();
  });
  document.getElementById("pgReset")?.addEventListener("click", reset);

  setMode("reinforce");
  reset();
})();
