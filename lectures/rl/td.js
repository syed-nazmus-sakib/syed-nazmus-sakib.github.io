/* Pearl — Chapter 04: SARSA vs Q-learning on a classic-style cliff */

(() => {
  "use strict";

  // 4×12 classic cliff layout (scaled to 4×8 for the panel):
  // Rows 0–2: safe plateau
  // Row 3: S, cliff…, G
  const ROWS = 4;
  const COLS = 8;
  const START = { r: 3, c: 0 };
  const GOAL = { r: 3, c: 7 };
  const ACTIONS = [
    { name: "↑", dr: -1, dc: 0 },
    { name: "→", dr: 0, dc: 1 },
    { name: "↓", dr: 1, dc: 0 },
    { name: "←", dr: 0, dc: -1 },
  ];

  function isCliff(r, c) {
    return r === 3 && c >= 1 && c <= 6;
  }
  function isGoal(r, c) {
    return r === GOAL.r && c === GOAL.c;
  }
  function isStart(r, c) {
    return r === START.r && c === START.c;
  }

  const S = {
    algo: "sarsa",
    Q: null,
    alpha0: 0.5,
    alpha: 0.5,
    gamma: 0.9,
    eps: 0.1,
    decayAlpha: true,
    episodes: 0,
    returns: [],
    lastDelta: null,
  };

  const gridEl = document.getElementById("tdGrid");
  const traceEl = document.getElementById("tdTrace");

  function emptyQ() {
    return Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ACTIONS.map(() => 0))
    );
  }

  function clip(r, c) {
    return {
      r: Math.max(0, Math.min(ROWS - 1, r)),
      c: Math.max(0, Math.min(COLS - 1, c)),
    };
  }

  function step(r, c, ai) {
    if (isGoal(r, c)) return { r, c, reward: 0, done: true };
    const a = ACTIONS[ai];
    let nr = r + a.dr;
    let nc = c + a.dc;
    ({ r: nr, c: nc } = clip(nr, nc));
    if (isCliff(nr, nc)) {
      return { r: START.r, c: START.c, reward: -100, done: false, fell: true };
    }
    if (isGoal(nr, nc)) return { r: nr, c: nc, reward: -1, done: true };
    return { r: nr, c: nc, reward: -1, done: false };
  }

  function argmaxQ(r, c) {
    const qs = S.Q[r][c];
    let best = 0;
    let bestV = -Infinity;
    let ties = 0;
    for (let i = 0; i < qs.length; i++) {
      if (qs[i] > bestV + 1e-12) {
        bestV = qs[i];
        best = i;
        ties = 1;
      } else if (Math.abs(qs[i] - bestV) <= 1e-12) {
        ties += 1;
        // break ties uniformly
        if (Math.random() < 1 / ties) best = i;
      }
    }
    return best;
  }

  function maxQ(r, c) {
    return Math.max(...S.Q[r][c]);
  }

  function allZero(r, c) {
    return S.Q[r][c].every((q) => Math.abs(q) < 1e-12);
  }

  function act(r, c) {
    if (Math.random() < S.eps) {
      return Math.floor(Math.random() * ACTIONS.length);
    }
    return argmaxQ(r, c);
  }

  function currentAlpha() {
    if (!S.decayAlpha) return S.alpha0;
    // 1/√(1+ep) decay — keeps learning but settles
    return S.alpha0 / Math.sqrt(1 + S.episodes / 50);
  }

  function set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function render() {
    if (!gridEl) return;
    gridEl.className = "dp-grid";
    gridEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    gridEl.style.aspectRatio = `${COLS} / ${ROWS}`;
    gridEl.style.maxWidth = "560px";
    gridEl.innerHTML = "";

    const vals = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (!isCliff(r, c)) vals.push(maxQ(r, c));
    const vmax = Math.max(...vals, 0.01);
    const vmin = Math.min(...vals, -0.01);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement("div");
        cell.className = "dp-cell";
        if (isCliff(r, c)) {
          cell.classList.add("cliff");
          cell.innerHTML = `<span class="dp-v">cliff</span><span class="dp-a">−100</span>`;
        } else if (isGoal(r, c)) {
          cell.classList.add("goal");
          cell.innerHTML = `<span class="dp-v">G</span><span class="dp-a">${maxQ(r, c).toFixed(1)}</span>`;
        } else {
          if (isStart(r, c)) cell.classList.add("start");
          const v = maxQ(r, c);
          const t = (v - vmin) / Math.max(vmax - vmin, 1e-6);
          cell.style.background = `rgba(201, 137, 74, ${(0.08 + 0.5 * t).toFixed(3)})`;
          const arrow = allZero(r, c) ? "·" : ACTIONS[argmaxQ(r, c)].name;
          cell.innerHTML = `<span class="dp-v">${v.toFixed(1)}</span><span class="dp-a">${arrow}</span>`;
        }
        gridEl.appendChild(cell);
      }
    }
  }

  function updateStats() {
    set("tdEpsCount", String(S.episodes));
    const last = S.returns[S.returns.length - 1];
    set("tdLastG", last === undefined ? "—" : last.toFixed(1));
    const window = S.returns.slice(-20);
    const avg = window.length
      ? window.reduce((a, b) => a + b, 0) / window.length
      : null;
    set("tdAvgG", avg === null ? "—" : avg.toFixed(1));
    set(
      "tdLastD",
      S.lastDelta === null || S.lastDelta === undefined
        ? "—"
        : S.lastDelta.toFixed(3)
    );
    const aLab = document.getElementById("tdAlphaL");
    if (aLab) aLab.textContent = currentAlpha().toFixed(3);
  }

  function runEpisode(logDetail) {
    let r = START.r;
    let c = START.c;
    let a = act(r, c);
    let G = 0;
    let steps = 0;
    const maxSteps = 500;
    let lastLine = "";
    const alpha = currentAlpha();

    while (steps < maxSteps) {
      const out = step(r, c, a);
      G += out.reward;

      let target;
      let a2 = null;

      if (out.done) {
        target = out.reward;
      } else if (S.algo === "sarsa") {
        a2 = act(out.r, out.c);
        target = out.reward + S.gamma * S.Q[out.r][out.c][a2];
      } else {
        target = out.reward + S.gamma * maxQ(out.r, out.c);
        a2 = act(out.r, out.c);
      }

      const delta = target - S.Q[r][c][a];
      S.Q[r][c][a] += alpha * delta;
      S.lastDelta = delta;

      if (logDetail && steps < 3) {
        lastLine +=
          `t=${steps} (${r},${c}) ${ACTIONS[a].name} → (${out.r},${out.c}) r=${out.reward}` +
          (out.fell ? " FELL" : "") +
          `\n  α=${alpha.toFixed(3)} target=${target.toFixed(3)} δ=${delta.toFixed(3)}\n`;
      }

      r = out.r;
      c = out.c;
      steps += 1;
      if (out.done) break;
      a = a2;
    }

    S.episodes += 1;
    S.returns.push(G);

    if (logDetail && traceEl) {
      const pathHint =
        S.algo === "sarsa"
          ? "SARSA evaluates the ε-greedy policy — falls during exploration hurt on-policy Q → prefers the safe upper rows."
          : "Q-learning targets max_a Q — optimal greedy path hugs the cliff; ε-greedy execution still falls sometimes.";
      traceEl.textContent =
        `Episode ${S.episodes} · ${S.algo.toUpperCase()} · G=${G.toFixed(1)} · steps=${steps} · α=${alpha.toFixed(3)}\n` +
        pathHint +
        "\n\n" +
        (lastLine || "(no early steps logged)");
    }
    return G;
  }

  function setAlgo(name) {
    S.algo = name;
    const label = document.getElementById("algoLabel");
    if (label) {
      label.textContent =
        name === "sarsa"
          ? "Active: SARSA (on-policy)"
          : "Active: Q-learning (off-policy)";
    }
    const bS = document.getElementById("algoSarsa");
    const bQ = document.getElementById("algoQ");
    if (name === "sarsa") {
      bS?.classList.remove("ghost");
      bQ?.classList.add("ghost");
    } else {
      bQ?.classList.remove("ghost");
      bS?.classList.add("ghost");
    }
  }

  function reset() {
    S.Q = emptyQ();
    S.episodes = 0;
    S.returns = [];
    S.lastDelta = null;
    if (traceEl) {
      traceEl.textContent =
        "Q reset. 4×8 cliff: safe plateau on rows 0–2, cliff on row 3. Try ε=0.1, α-decay ON, 200+ episodes — SARSA’s greedy path should stay up; Q-learning hugs the edge.";
    }
    updateStats();
    render();
  }

  const bindSlider = (id, key, labelId, fmt) => {
    const el = document.getElementById(id);
    el?.addEventListener("input", () => {
      S[key] = Number(el.value);
      if (key === "alpha0") S.alpha = S.alpha0;
      const lab = document.getElementById(labelId);
      if (lab) lab.textContent = fmt(S[key]);
    });
  };
  bindSlider("tdAlpha", "alpha0", "tdAlphaL", (v) => v.toFixed(2));
  bindSlider("tdGamma", "gamma", "tdGammaL", (v) => v.toFixed(2));
  bindSlider("tdEps", "eps", "tdEpsL", (v) => v.toFixed(2));

  document.getElementById("tdAlphaDecay")?.addEventListener("change", (e) => {
    S.decayAlpha = e.target.checked;
  });

  document.getElementById("algoSarsa")?.addEventListener("click", () => setAlgo("sarsa"));
  document.getElementById("algoQ")?.addEventListener("click", () => setAlgo("q"));
  document.getElementById("tdEp")?.addEventListener("click", () => {
    runEpisode(true);
    updateStats();
    render();
  });
  document.getElementById("tdMany")?.addEventListener("click", () => {
    for (let i = 0; i < 49; i++) runEpisode(false);
    runEpisode(true);
    updateStats();
    render();
  });
  document.getElementById("tdReset")?.addEventListener("click", reset);

  // defaults matching pedagogy
  const epsEl = document.getElementById("tdEps");
  if (epsEl) {
    epsEl.value = "0.1";
    S.eps = 0.1;
    set("tdEpsL", "0.10");
  }

  setAlgo("sarsa");
  reset();
})();
