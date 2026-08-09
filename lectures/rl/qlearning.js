/* Pearl — Ch 05: tabular Q-learning with replay + target + double */

(() => {
  "use strict";

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
  const BUF_CAP = 500;
  const BATCH = 16;

  function isCliff(r, c) {
    return r === 3 && c >= 1 && c <= 6;
  }
  function isGoal(r, c) {
    return r === GOAL.r && c === GOAL.c;
  }

  const S = {
    Q: null,
    Qt: null, // target
    buffer: [],
    alpha: 0.4,
    gamma: 0.95,
    eps: 0.15,
    syncEvery: 10,
    useReplay: true,
    useTarget: true,
    useDouble: false,
    episodes: 0,
    updates: 0,
    syncs: 0,
    returns: [],
    recentAbsDelta: [],
  };

  function emptyQ() {
    return Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ACTIONS.map(() => 0))
    );
  }

  function copyQ(src) {
    return src.map((row) => row.map((qs) => qs.slice()));
  }

  function clip(r, c) {
    return {
      r: Math.max(0, Math.min(ROWS - 1, r)),
      c: Math.max(0, Math.min(COLS - 1, c)),
    };
  }

  // goal reward in classic cliff is -1 on the transition into G (already in step())
  function envStep(r, c, ai) {
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

  function maxQ(table, r, c) {
    return Math.max(...table[r][c]);
  }

  function argmaxQ(table, r, c) {
    const qs = table[r][c];
    let best = 0;
    let bestV = -Infinity;
    for (let i = 0; i < qs.length; i++) {
      if (qs[i] > bestV + 1e-12) {
        bestV = qs[i];
        best = i;
      }
    }
    return best;
  }

  function act(r, c) {
    if (Math.random() < S.eps) return Math.floor(Math.random() * ACTIONS.length);
    return argmaxQ(S.Q, r, c);
  }

  function bootstrapValue(nr, nc, done) {
    if (done) return 0;
    // Double Q requires a lagged evaluator; without target it collapses to max Q.
    const useDouble = S.useDouble && S.useTarget;
    const evalNet = S.useTarget ? S.Qt : S.Q;
    if (useDouble) {
      const aStar = argmaxQ(S.Q, nr, nc);
      return evalNet[nr][nc][aStar];
    }
    return maxQ(evalNet, nr, nc);
  }

  function tdUpdate(s, a, r, sp, done) {
    const y = r + S.gamma * bootstrapValue(sp.r, sp.c, done);
    const delta = y - S.Q[s.r][s.c][a];
    S.Q[s.r][s.c][a] += S.alpha * delta;
    S.updates += 1;
    S.recentAbsDelta.push(Math.abs(delta));
    if (S.recentAbsDelta.length > 100) S.recentAbsDelta.shift();

    if (S.useTarget && S.updates % S.syncEvery === 0) {
      S.Qt = copyQ(S.Q);
      S.syncs += 1;
    }
    return delta;
  }

  function pushBuffer(tr) {
    S.buffer.push(tr);
    if (S.buffer.length > BUF_CAP) S.buffer.shift();
  }

  function replayLearn() {
    if (S.buffer.length < Math.min(BATCH, 8)) return;
    const n = Math.min(BATCH, S.buffer.length);
    let lastDelta = 0;
    for (let i = 0; i < n; i++) {
      const tr = S.buffer[Math.floor(Math.random() * S.buffer.length)];
      lastDelta = tdUpdate(
        { r: tr.sr, c: tr.sc },
        tr.a,
        tr.r,
        { r: tr.spr, c: tr.spc },
        tr.done
      );
    }
    return lastDelta;
  }

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function ensureStyles() {
    /* shared rules in styles.css */
  }

  function paint(el, table, showArrows) {
    if (!el) return;
    const vals = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (!isCliff(r, c)) vals.push(maxQ(table, r, c));
    const vmax = Math.max(...vals, 0.01);
    const vmin = Math.min(...vals, -0.01);
    el.className = "dp-grid";
    el.innerHTML = "";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement("div");
        cell.className = "dp-cell";
        if (isCliff(r, c)) {
          cell.classList.add("cliff");
          cell.innerHTML = `<span class="dp-v">cliff</span>`;
        } else if (isGoal(r, c)) {
          cell.classList.add("goal");
          cell.innerHTML = `<span class="dp-v">G</span><span class="dp-a">${maxQ(table, r, c).toFixed(1)}</span>`;
        } else {
          const v = maxQ(table, r, c);
          const t = (v - vmin) / Math.max(vmax - vmin, 1e-6);
          cell.style.background = `rgba(201,137,74,${(0.08 + 0.5 * t).toFixed(3)})`;
          const qs = table[r][c];
          const mx = Math.max(...qs);
          const ties = qs.filter((q) => Math.abs(q - mx) < 1e-12).length;
          const arrow =
            !showArrows ? "·" : ties === qs.length && mx === 0 ? "·" : ACTIONS[argmaxQ(table, r, c)].name;
          cell.innerHTML = `<span class="dp-v">${v.toFixed(1)}</span><span class="dp-a">${arrow}</span>`;
        }
        el.appendChild(cell);
      }
    }
  }

  function overestProxy() {
    // mean (max Q - max Q⁻)+ as a crude lag/optimism proxy when target is on
    if (!S.useTarget) return null;
    let sum = 0;
    let n = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (isCliff(r, c)) continue;
        const d = maxQ(S.Q, r, c) - maxQ(S.Qt, r, c);
        if (d > 0) sum += d;
        n += 1;
      }
    }
    return n ? sum / n : 0;
  }

  function render() {
    ensureStyles();
    const tgtTable = S.useTarget ? S.Qt : S.Q;
    paint(document.getElementById("qlGrid"), S.Q, true);
    paint(document.getElementById("qlGridTgt"), tgtTable, false);
    set("qlEp", String(S.episodes));
    set("qlUp", String(S.updates));
    set("qlBuf", String(S.buffer.length));
    set("qlSyncs", String(S.syncs));
    const avgD = S.recentAbsDelta.length
      ? S.recentAbsDelta.reduce((a, b) => a + b, 0) / S.recentAbsDelta.length
      : null;
    set("qlDelta", avgD === null ? "—" : avgD.toFixed(2));
    const last = S.returns[S.returns.length - 1];
    set("qlG", last === undefined ? "—" : last.toFixed(1));
    const w = S.returns.slice(-20);
    set(
      "qlGavg",
      w.length ? (w.reduce((a, b) => a + b, 0) / w.length).toFixed(1) : "—"
    );
    const ov = overestProxy();
    set("qlOver", ov === null ? "n/a" : ov.toFixed(2));
  }

  function runEpisode(log) {
    let r = START.r;
    let c = START.c;
    let G = 0;
    let steps = 0;
    let fell = 0;
    let sampleDelta = null;

    while (steps < 200) {
      const a = act(r, c);
      const out = envStep(r, c, a);
      G += out.reward;
      if (out.fell) fell += 1;

      const tr = {
        sr: r,
        sc: c,
        a,
        r: out.reward,
        spr: out.r,
        spc: out.c,
        done: !!out.done,
      };

      if (S.useReplay) {
        pushBuffer(tr);
        sampleDelta = replayLearn();
      } else {
        sampleDelta = tdUpdate(
          { r, c },
          a,
          out.reward,
          { r: out.r, c: out.c },
          out.done
        );
      }

      r = out.r;
      c = out.c;
      steps += 1;
      if (out.done) break;
    }

    S.episodes += 1;
    S.returns.push(G);

    if (log) {
      const el = document.getElementById("qlTrace");
      if (el) {
        const mode = [
          S.useReplay ? "replay" : "online",
          S.useTarget ? `target@${S.syncEvery}` : "no-target",
          S.useDouble ? "double" : "vanilla-max",
        ].join(" · ");
        el.textContent =
          `Episode ${S.episodes} · G=${G.toFixed(1)} · steps=${steps} · falls=${fell}\n` +
          `Mode: ${mode}\n` +
          `Buffer ${S.buffer.length}/${BUF_CAP}, updates=${S.updates}, hard syncs=${S.syncs}\n` +
          `Bootstrap: y = r + γ·${
            S.useDouble && S.useTarget
              ? "Q⁻(s′, argmax_a Q(s′,a))  [Double]"
              : S.useTarget
                ? "max_a Q⁻(s′,a)"
                : "max_a Q(s′,a)"
          }\n` +
          `Last batch |δ|~${
            sampleDelta === null || sampleDelta === undefined
              ? "—"
              : Math.abs(sampleDelta).toFixed(3)
          }\n` +
          `Tip: with target OFF, Q⁻ tracks online Q (always resynced). Double needs target ON to decouple select/evaluate.`;
      }
    }
  }

  function reset() {
    S.Q = emptyQ();
    S.Qt = emptyQ();
    S.buffer = [];
    S.episodes = 0;
    S.updates = 0;
    S.syncs = 0;
    S.returns = [];
    S.recentAbsDelta = [];
    const el = document.getElementById("qlTrace");
    if (el) {
      el.textContent =
        "Reset. Recommended: replay ON + target ON, run 100 episodes, then try Double. Q⁻ lags online Q between hard syncs.";
    }
    render();
  }

  function syncFlags() {
    const prevTarget = S.useTarget;
    S.useReplay = !!document.getElementById("useReplay")?.checked;
    S.useTarget = !!document.getElementById("useTarget")?.checked;
    S.useDouble = !!document.getElementById("useDouble")?.checked;

    const doubleEl = document.getElementById("useDouble");
    const doubleLabel = doubleEl?.closest("label");
    if (doubleEl) {
      doubleEl.disabled = !S.useTarget;
      if (!S.useTarget) {
        doubleEl.checked = false;
        S.useDouble = false;
      }
    }
    if (doubleLabel) {
      doubleLabel.style.opacity = S.useTarget ? "1" : "0.45";
      doubleLabel.title = S.useTarget
        ? ""
        : "Enable target network first — Double needs Q⁻ ≠ Q for select/evaluate split";
    }

    // Keep Q⁻ honest: when target is off, mirror online Q; when turning target
    // back on, seed Q⁻ from current Q so we don't bootstrap off zeros.
    if (!S.useTarget) {
      S.Qt = copyQ(S.Q);
    } else if (!prevTarget && S.useTarget) {
      S.Qt = copyQ(S.Q);
      S.syncs += 1;
    }
    render();
  }

  ["useReplay", "useTarget", "useDouble"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", syncFlags);
  });

  const bind = (id, key, lab, fmt) => {
    const el = document.getElementById(id);
    el?.addEventListener("input", () => {
      S[key] = Number(el.value);
      const l = document.getElementById(lab);
      if (l) l.textContent = fmt(S[key]);
    });
  };
  bind("qlAlpha", "alpha", "qlAlphaL", (v) => v.toFixed(2));
  bind("qlGamma", "gamma", "qlGammaL", (v) => v.toFixed(2));
  bind("qlEps", "eps", "qlEpsL", (v) => v.toFixed(2));
  bind("qlSync", "syncEvery", "qlSyncL", (v) => String(v));

  document.getElementById("qlStep")?.addEventListener("click", () => {
    syncFlags();
    runEpisode(true);
    render();
  });
  document.getElementById("qlMany")?.addEventListener("click", () => {
    syncFlags();
    for (let i = 0; i < 99; i++) runEpisode(false);
    runEpisode(true);
    render();
  });
  document.getElementById("qlReset")?.addEventListener("click", () => {
    syncFlags();
    reset();
  });

  syncFlags();
  reset();
})();
