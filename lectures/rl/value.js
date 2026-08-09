/* Pearl — Chapter 02: V/Q visual studio + iterative policy evaluation */

(() => {
  "use strict";

  const N = 4;
  const GOAL = { r: 3, c: 3 };
  const ACTIONS = [
    { name: "↑", id: "U", dr: -1, dc: 0 },
    { name: "→", id: "R", dr: 0, dc: 1 },
    { name: "↓", id: "D", dr: 1, dc: 0 },
    { name: "←", id: "L", dr: 0, dc: -1 },
  ];

  function key(r, c) {
    return `${r},${c}`;
  }

  function isGoal(r, c) {
    return r === GOAL.r && c === GOAL.c;
  }

  function clipMove(r, c, dr, dc) {
    const nr = Math.max(0, Math.min(N - 1, r + dr));
    const nc = Math.max(0, Math.min(N - 1, c + dc));
    return { r: nr, c: nc };
  }

  /** Soft policy: prefer Down/Right toward goal, but keep mass on all actions. */
  function defaultPiScores(r, c) {
    if (isGoal(r, c)) return ACTIONS.map(() => 0.25);
    const scores = ACTIONS.map((a) => {
      let s = 0.05;
      if (a.id === "D" && r < GOAL.r) s += 0.45;
      if (a.id === "R" && c < GOAL.c) s += 0.45;
      if (a.id === "U" && r > GOAL.r) s += 0.45;
      if (a.id === "L" && c > GOAL.c) s += 0.45;
      return s;
    });
    const z = scores.reduce((a, b) => a + b, 0);
    return scores.map((s) => s / z);
  }

  /** Per-state policy overrides for the visual studio (null ⇒ default). */
  const piOverrides = {};

  function pi(r, c) {
    const k = key(r, c);
    if (piOverrides[k]) return piOverrides[k].slice();
    return defaultPiScores(r, c);
  }

  function setPiOverride(r, c, probs) {
    const z = probs.reduce((a, b) => a + b, 0) || 1;
    piOverrides[key(r, c)] = probs.map((p) => p / z);
  }

  function clearPiOverrides() {
    Object.keys(piOverrides).forEach((k) => delete piOverrides[k]);
  }

  function nextState(r, c, action) {
    if (isGoal(r, c)) return { r, c };
    return clipMove(r, c, action.dr, action.dc);
  }

  function reward(r, c, nr, nc) {
    if (isGoal(r, c)) return 0;
    if (isGoal(nr, nc)) return 1;
    return 0;
  }

  function emptyV() {
    return Array.from({ length: N }, () => Array(N).fill(0));
  }

  function emptyQ() {
    return Array.from({ length: N }, () =>
      Array.from({ length: N }, () => ACTIONS.map(() => 0))
    );
  }

  /** Iterate T^π until convergence. */
  function solveV(gamma, theta = 1e-8, maxIter = 600) {
    let V = emptyV();
    for (let k = 0; k < maxIter; k++) {
      const Vnew = emptyV();
      let delta = 0;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (isGoal(r, c)) {
            Vnew[r][c] = 0;
            continue;
          }
          const probs = pi(r, c);
          let v = 0;
          ACTIONS.forEach((a, i) => {
            const n = nextState(r, c, a);
            const rew = reward(r, c, n.r, n.c);
            const cont = isGoal(n.r, n.c) ? 0 : V[n.r][n.c];
            v += probs[i] * (rew + gamma * cont);
          });
          Vnew[r][c] = v;
          delta = Math.max(delta, Math.abs(v - V[r][c]));
        }
      }
      V = Vnew;
      if (delta < theta) break;
    }
    return V;
  }

  /** Equation (2): Q from converged V. */
  function computeQFromV(V, gamma) {
    const Q = emptyQ();
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (isGoal(r, c)) continue;
        ACTIONS.forEach((a, i) => {
          const n = nextState(r, c, a);
          const rew = reward(r, c, n.r, n.c);
          const cont = isGoal(n.r, n.c) ? 0 : V[n.r][n.c];
          Q[r][c][i] = rew + gamma * cont;
        });
      }
    }
    return Q;
  }

  /** Equation (1): V(s) from Q and π. */
  function vFromQ(Q, r, c) {
    if (isGoal(r, c)) return 0;
    const probs = pi(r, c);
    return ACTIONS.reduce((sum, _, i) => sum + probs[i] * Q[r][c][i], 0);
  }

  function bestAction(Q, r, c) {
    let best = 0;
    let bestQ = -Infinity;
    for (let i = 0; i < ACTIONS.length; i++) {
      if (Q[r][c][i] > bestQ) {
        bestQ = Q[r][c][i];
        best = i;
      }
    }
    return best;
  }

  function colorFor(v, vmax) {
    if (vmax <= 1e-9) return "rgba(243,231,214,0.08)";
    const t = Math.max(0, Math.min(1, v / vmax));
    return `rgba(201, 137, 74, ${(0.18 + 0.62 * t).toFixed(3)})`;
  }


  // ============================================================
  // Visual V / Q studio
  // ============================================================

  const studio = {
    gamma: 0.9,
    V: emptyV(),
    Q: emptyQ(),
    solved: false,
    mode: "v",
    sel: { r: 1, c: 1 },
    selAction: 1,
  };

  const MODE_BLURBS = {
    v: "<strong>State value.</strong> Each cell shows V<sup>π</sup>(s): expected discounted return if you <em>start</em> in that cell and follow π. Brighter = better position.",
    q: "<strong>Action value.</strong> Click a state. Arrows show Q<sup>π</sup>(s,a): expected return if you take that move <em>now</em>, then follow π. Thicker/brighter arrow = better move.",
    vfromq:
      "<strong>Equation (1).</strong> V<sup>π</sup>(s) = Σ<sub>a</sub> π(a|s) Q<sup>π</sup>(s,a). Bars show each Q; stripe width = π weight; product bars = contribution. Drag π sliders — V is the weighted average.",
    qfromv:
      "<strong>Equation (2).</strong> Q<sup>π</sup>(s,a) = R(s,a) + γ V<sup>π</sup>(s'). Pick an action; see immediate reward plus discounted value of the landing cell.",
    chain:
      "<strong>Chain (1)+(2).</strong> Substitute (2) into (1): you recover the Bellman expectation backup — average over actions and successors of [R + γV(s')].",
  };

  const vqGrid = document.getElementById("vqGrid");
  const vqEquation = document.getElementById("vqEquation");
  const vqBars = document.getElementById("vqBars");
  const vqActionPick = document.getElementById("vqActionPick");
  const vqActionBtns = document.getElementById("vqActionBtns");
  const vqPolicySliders = document.getElementById("vqPolicySliders");
  const vqPiSliders = document.getElementById("vqPiSliders");
  const vqModeBlurb = document.getElementById("vqModeBlurb");
  const vqGridCaption = document.getElementById("vqGridCaption");
  const vqRolloutLog = document.getElementById("vqRolloutLog");
  const vqRolloutText = document.getElementById("vqRolloutText");

  function setVq(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function studioSolve() {
    studio.V = solveV(studio.gamma);
    studio.Q = computeQFromV(studio.V, studio.gamma);
    studio.solved = true;
    renderStudio();
  }

  function renderStudioGrid() {
    if (!vqGrid) return;
    const { mode, sel, V, Q, solved } = studio;
    const flatV = V.flat();
    const vmax = Math.max(...flatV, 1e-9);

    vqGrid.innerHTML = "";
    vqGrid.style.gridTemplateColumns = `repeat(${N}, 1fr)`;

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "vq-cell";
        if (isGoal(r, c)) cell.classList.add("goal");
        if (sel.r === r && sel.c === c) cell.classList.add("selected");

        const v = solved ? V[r][c] : 0;

        if (mode === "v" || mode === "vfromq" || mode === "chain") {
          const showV = mode === "vfromq" && solved ? vFromQ(Q, r, c) : v;
          cell.style.background = isGoal(r, c)
            ? "rgba(111,155,120,0.38)"
            : colorFor(showV, vmax);
          if (isGoal(r, c)) {
            cell.innerHTML = `<span class="vq-main">G</span><span class="vq-sub">V=0</span>`;
          } else {
            const label = mode === "vfromq" && solved ? "V̂" : "V";
            cell.innerHTML =
              `<span class="vq-main">${showV.toFixed(3)}</span>` +
              `<span class="vq-sub">${label}(s)</span>`;
          }
        } else if (mode === "q" || mode === "qfromv") {
          const selected = sel.r === r && sel.c === c;
          cell.style.background = isGoal(r, c)
            ? "rgba(111,155,120,0.38)"
            : selected
              ? "rgba(201,137,74,0.14)"
              : colorFor(v, vmax);

          if (isGoal(r, c)) {
            cell.innerHTML = `<span class="vq-main">G</span>`;
          } else if (selected && solved) {
            const parts = ACTIONS.map((a, i) => {
              const q = Q[r][c][i];
              const hot = i === bestAction(Q, r, c);
              const n = nextState(r, c, a);
              const land = isGoal(n.r, n.c) ? "G" : `(${n.r},${n.c})`;
              return (
                `<span class="vq-q-arm ${hot ? "best" : ""}" data-ai="${i}" title="Q=${q.toFixed(4)} → ${land}">` +
                `<span class="vq-q-arrow">${a.name}</span>` +
                `<span class="vq-q-val">${q.toFixed(2)}</span>` +
                `</span>`
              );
            }).join("");
            cell.innerHTML = `<div class="vq-q-cross">${parts}</div>`;
          } else {
            const best = solved ? bestAction(Q, r, c) : 0;
            cell.innerHTML =
              `<span class="vq-main">${solved ? V[r][c].toFixed(2) : "·"}</span>` +
              `<span class="vq-sub">${solved ? `best ${ACTIONS[best].name}` : "click"}</span>`;
          }
        }

        cell.title = `(${r},${c})`;
        cell.addEventListener("click", () => {
          studio.sel = { r, c };
          if (mode === "qfromv" && !isGoal(r, c)) studio.selAction = bestAction(studio.Q, r, c);
          renderStudio();
        });
        vqGrid.appendChild(cell);
      }
    }
  }

  function renderStudioBars() {
    if (!vqBars) return;
    const { mode, sel, Q, solved } = studio;
    const show = mode === "vfromq" && solved && !isGoal(sel.r, sel.c);
    vqBars.hidden = !show;
    if (!show) {
      vqBars.innerHTML = "";
      return;
    }

    const probs = pi(sel.r, sel.c);
    const qs = Q[sel.r][sel.c];
    const maxQ = Math.max(...qs, 1e-6);
    let html = "";
    let total = 0;
    ACTIONS.forEach((a, i) => {
      const contrib = probs[i] * qs[i];
      total += contrib;
      html +=
        `<div class="bar-row">` +
        `<span>${a.name} · π=${probs[i].toFixed(2)}</span>` +
        `<div class="bar-track"><div class="bar-fill" style="width:${((qs[i] / maxQ) * 100).toFixed(1)}%;opacity:0.55"></div>` +
        `<div class="bar-fill" style="width:${((contrib / maxQ) * 100).toFixed(1)}%;background:var(--sugar-bright);margin-top:-10px"></div></div>` +
        `<span>${qs[i].toFixed(3)}</span>` +
        `</div>`;
    });
    html +=
      `<div class="bar-row" style="margin-top:0.35rem;padding-top:0.45rem;border-top:1px dashed var(--line)">` +
      `<span>Σ πQ</span><span></span><strong style="color:var(--sugar-bright)">${total.toFixed(4)}</strong></div>`;
    vqBars.innerHTML = html;
  }

  function renderStudioEquation() {
    if (!vqEquation) return;
    const { mode, sel, V, Q, gamma, solved } = studio;
    const { r, c } = sel;
    const lines = [];

    if (!solved) {
      vqEquation.textContent =
        "Press “Solve V^π, Q^π” to compute exact values for the current policy and γ.";
      return;
    }

    if (isGoal(r, c)) {
      vqEquation.textContent =
        "Terminal goal. By convention V^π(s)=0 and no actions are taken from here.";
      return;
    }

    const probs = pi(r, c);
    const v = V[r][c];
    const vHat = vFromQ(Q, r, c);

    if (mode === "v") {
      lines.push(`V^π(${r},${c}) = E_π[ G_t | s_t = (${r},${c}) ]`);
      lines.push(`= expected total discounted reward starting here, following π`);
      lines.push("");
      lines.push(`Solved value: V^π(s) = ${v.toFixed(6)}`);
      lines.push(`(Nearby cells with higher V are better positions under π.)`);
    } else if (mode === "q") {
      lines.push(`Q^π(s,a) = E_π[ G_t | s_t=s, a_t=a ]`);
      lines.push(`At s=(${r},${c}), compare moves:`);
      lines.push("");
      ACTIONS.forEach((a, i) => {
        const mark = i === bestAction(Q, r, c) ? "  ← best" : "";
        lines.push(`  Q(s,${a.name}) = ${Q[r][c][i].toFixed(6)}${mark}`);
      });
      lines.push("");
      lines.push(`V^π(s) = Σ_a π(a|s) Q(s,a) = ${vHat.toFixed(6)}`);
    } else if (mode === "vfromq") {
      lines.push(`V^π(s) = Σ_a π(a|s) Q^π(s,a)   [equation (1)]`);
      lines.push(`At s=(${r},${c}), γ=${gamma.toFixed(2)}:`);
      lines.push("");
      ACTIONS.forEach((a, i) => {
        lines.push(
          `  π(${a.name}|s)=${probs[i].toFixed(3)} × Q=${Q[r][c][i].toFixed(4)} = ${(probs[i] * Q[r][c][i]).toFixed(5)}`
        );
      });
      lines.push("");
      lines.push(`Σ_a π Q = ${vHat.toFixed(6)}`);
      lines.push(`Stored V^π(s) = ${v.toFixed(6)}   |Δ| = ${Math.abs(vHat - v).toFixed(8)}`);
    } else if (mode === "qfromv") {
      const ai = studio.selAction;
      const a = ACTIONS[ai];
      const n = nextState(r, c, a);
      const rew = reward(r, c, n.r, n.c);
      const vNext = isGoal(n.r, n.c) ? 0 : V[n.r][n.c];
      const q = Q[r][c][ai];
      lines.push(`Q^π(s,a) = R(s,a) + γ V^π(s')   [equation (2)]`);
      lines.push(`At s=(${r},${c}), a=${a.name} → s'=(${n.r},${n.c}):`);
      lines.push("");
      lines.push(`  R(s,a) = ${rew.toFixed(4)}`);
      lines.push(`  γ V^π(s') = ${gamma.toFixed(2)} × ${vNext.toFixed(4)} = ${(gamma * vNext).toFixed(5)}`);
      lines.push(`  Q^π(s,a) = ${q.toFixed(6)}`);
    } else if (mode === "chain") {
      lines.push(`Chain: substitute (2) into (1)`);
      lines.push(`V^π(s) = Σ_a π(a|s) [ R(s,a) + γ Σ_{s'} P(s'|s,a) V^π(s') ]`);
      lines.push(`At s=(${r},${c}) with deterministic moves (clip at walls):`);
      lines.push("");
      let total = 0;
      ACTIONS.forEach((a, i) => {
        const n = nextState(r, c, a);
        const rew = reward(r, c, n.r, n.c);
        const vNext = isGoal(n.r, n.c) ? 0 : V[n.r][n.c];
        const bracket = rew + gamma * vNext;
        const term = probs[i] * bracket;
        total += term;
        lines.push(
          `  π(${a.name})=${probs[i].toFixed(2)} × (${rew.toFixed(1)} + ${gamma.toFixed(2)}·${vNext.toFixed(3)}) = ${term.toFixed(5)}`
        );
      });
      lines.push("");
      lines.push(`Bellman backup = ${total.toFixed(6)}`);
      lines.push(`V^π(s) stored = ${v.toFixed(6)}`);
      lines.push(`Same number — (1) and (2) are conjugate views of one backup.`);
    }

    vqEquation.textContent = lines.join("\n");
  }

  function renderStudioControls() {
    const { mode, sel } = studio;
    if (vqModeBlurb) vqModeBlurb.innerHTML = MODE_BLURBS[mode] || "";

    if (vqGridCaption) {
      const caps = {
        v: "Heat map of V^π(s). Goal at (3,3), reward +1 on entry.",
        q: "Click a cell to see Q^π(s,·) as labeled arrows. Best move highlighted.",
        vfromq: "Left: V̂ from Σ πQ. Right: bar chart decomposes the weighted sum.",
        qfromv: "Select state + action. Equation panel shows R + γV(s') arithmetic.",
        chain: "Each cell could be updated by the Bellman expectation sum shown for selected s.",
      };
      vqGridCaption.textContent = caps[mode] || "";
    }

    if (vqActionPick) vqActionPick.hidden = mode !== "qfromv";
    if (vqPolicySliders) vqPolicySliders.hidden = mode !== "vfromq";
    if (vqRolloutLog) vqRolloutLog.hidden = mode !== "v";

    if (vqActionBtns && mode === "qfromv") {
      vqActionBtns.innerHTML = "";
      ACTIONS.forEach((a, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn small" + (studio.selAction === i ? "" : " ghost");
        b.textContent = a.name;
        b.addEventListener("click", () => {
          studio.selAction = i;
          renderStudio();
        });
        vqActionBtns.appendChild(b);
      });
    }

    if (vqPiSliders && mode === "vfromq" && !isGoal(sel.r, sel.c)) {
      const probs = pi(sel.r, sel.c);
      vqPiSliders.innerHTML = "";
      ACTIONS.forEach((a, i) => {
        const wrap = document.createElement("label");
        wrap.className = "slider-label";
        wrap.innerHTML = `${a.name}  π(${a.id}|s)<input type="range" min="0" max="100" step="1" value="${Math.round(probs[i] * 100)}" data-pi-i="${i}" /><strong>${probs[i].toFixed(2)}</strong>`;
        const input = wrap.querySelector("input");
        input.addEventListener("input", () => {
          const newP = pi(sel.r, sel.c).slice();
          newP[i] = Number(input.value) / 100;
          setPiOverride(sel.r, sel.c, newP);
          studio.V = solveV(studio.gamma);
          studio.Q = computeQFromV(studio.V, studio.gamma);
          renderStudio();
        });
        vqPiSliders.appendChild(wrap);
      });
    }
  }

  function renderStudioStats() {
    const { sel, V, Q, solved } = studio;
    setVq("vqSel", `(${sel.r},${sel.c})`);
    if (!solved || isGoal(sel.r, sel.c)) {
      setVq("vqVs", "—");
      setVq("vqQsa", "—");
      setVq("vqBest", "—");
      return;
    }
    const ai = studio.selAction;
    setVq("vqVs", V[sel.r][sel.c].toFixed(4));
    setVq("vqQsa", Q[sel.r][sel.c][ai].toFixed(4));
    setVq("vqBest", ACTIONS[bestAction(Q, sel.r, sel.c)].name);
  }

  function rolloutOnce() {
    if (!studio.solved || !vqRolloutText || !vqRolloutLog) return;
    const { sel, gamma, V } = studio;
    const { r, c } = sel;
    if (isGoal(r, c)) return;

    let cr = r;
    let cc = c;
    let G = 0;
    const path = [`start (${cr},${cc})`];
    let t = 0;
    const maxT = 40;

    while (t < maxT) {
      const probs = pi(cr, cc);
      let u = Math.random();
      let ai = probs.length - 1;
      for (let i = 0; i < probs.length; i++) {
        u -= probs[i];
        if (u <= 0) {
          ai = i;
          break;
        }
      }
      const a = ACTIONS[ai];
      const n = nextState(cr, cc, a);
      const rew = reward(cr, cc, n.r, n.c);
      G += Math.pow(gamma, t) * rew;
      path.push(`t=${t} ${a.name} → (${n.r},${n.c}) r=${rew.toFixed(1)}  G_so_far=${G.toFixed(3)}`);
      cr = n.r;
      cc = n.c;
      t += 1;
      if (isGoal(cr, cc)) break;
    }

    const lines = [];
    lines.push(`One stochastic rollout from s=(${r},${c}) under π, γ=${gamma.toFixed(2)}`);
    lines.push(`(V^π(s)=${V[r][c].toFixed(4)} is the average of infinitely many such paths)`);
    lines.push("");
    lines.push(...path);
    lines.push("");
    lines.push(`This path return G₀ = ${G.toFixed(4)}`);
    vqRolloutText.textContent = lines.join("\n");
    vqRolloutLog.hidden = false;
  }

  function renderStudio() {
    renderStudioGrid();
    renderStudioBars();
    renderStudioEquation();
    renderStudioControls();
    renderStudioStats();
  }

  function setStudioMode(mode) {
    studio.mode = mode;
    document.querySelectorAll(".vq-tab").forEach((tab) => {
      const on = tab.dataset.vqMode === mode;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderStudio();
  }

  document.querySelectorAll(".vq-tab").forEach((tab) => {
    tab.addEventListener("click", () => setStudioMode(tab.dataset.vqMode));
  });

  document.getElementById("vqSolve")?.addEventListener("click", studioSolve);
  document.getElementById("vqRollout")?.addEventListener("click", rolloutOnce);
  document.getElementById("vqGamma")?.addEventListener("input", (e) => {
    studio.gamma = Number(e.target.value);
    const lab = document.getElementById("vqGammaLabel");
    if (lab) lab.textContent = studio.gamma.toFixed(2);
    studio.solved = false;
    renderStudio();
  });

  // ============================================================
  // Iterative policy evaluation lab (existing)
  // ============================================================

  const evalState = {
    V: emptyV(),
    gamma: 0.9,
    iter: 0,
  };

  const heat = document.getElementById("valueHeat");
  const trace = document.getElementById("bellmanTrace");
  const inspectSelect = document.getElementById("inspectSelect");
  const inspectOut = document.getElementById("inspectOut");

  function backupOnce() {
    const g = evalState.gamma;
    const Vnew = emptyV();
    let maxDelta = 0;
    const lines = [];

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (isGoal(r, c)) {
          Vnew[r][c] = 0;
          continue;
        }
        const probs = pi(r, c);
        let v = 0;
        ACTIONS.forEach((a, i) => {
          const n = nextState(r, c, a);
          const rew = reward(r, c, n.r, n.c);
          const cont = isGoal(n.r, n.c) ? 0 : evalState.V[n.r][n.c];
          v += probs[i] * (rew + g * cont);
        });
        Vnew[r][c] = v;
        maxDelta = Math.max(maxDelta, Math.abs(v - evalState.V[r][c]));
      }
    }

    const sr = 1;
    const sc = 1;
    const probs = pi(sr, sc);
    lines.push(`Sweep k=${evalState.iter} → k=${evalState.iter + 1}, γ=${g.toFixed(2)}`);
    lines.push(`Example backup at s=(${sr},${sc}), old V=${evalState.V[sr][sc].toFixed(4)}`);
    ACTIONS.forEach((a, i) => {
      const n = nextState(sr, sc, a);
      const rew = reward(sr, sc, n.r, n.c);
      const cont = isGoal(n.r, n.c) ? 0 : evalState.V[n.r][n.c];
      const term = probs[i] * (rew + g * cont);
      lines.push(
        `  a=${a.name} π=${probs[i].toFixed(2)} → (${n.r},${n.c})  ` +
          `[r+γV'= ${rew.toFixed(1)}+${g.toFixed(2)}·${cont.toFixed(3)}]  contrib=${term.toFixed(4)}`
      );
    });
    lines.push(`  new V(${sr},${sc}) = ${Vnew[sr][sc].toFixed(4)}   ‖Δ‖∞ this sweep = ${maxDelta.toFixed(5)}`);

    evalState.V = Vnew;
    evalState.iter += 1;
    if (trace) trace.textContent = lines.join("\n");
    renderEval();
    updateInspect();
    return maxDelta;
  }

  function renderEval() {
    if (!heat) return;
    const flat = evalState.V.flat();
    const vmax = Math.max(...flat, 1e-9);
    heat.innerHTML = "";
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = document.createElement("div");
        cell.className = "vcell";
        const v = evalState.V[r][c];
        cell.style.background = isGoal(r, c)
          ? "rgba(111,155,120,0.35)"
          : colorFor(v, vmax);
        cell.textContent = isGoal(r, c) ? "G" : v.toFixed(3);
        cell.title = `(${r},${c}) V=${v.toFixed(4)}`;
        cell.addEventListener("click", () => {
          if (inspectSelect) {
            inspectSelect.value = key(r, c);
            updateInspect();
          }
        });
        heat.appendChild(cell);
      }
    }

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("valIter", String(evalState.iter));
    set("valMax", vmax.toFixed(4));
    set("valStart", evalState.V[0][0].toFixed(4));
  }

  function fillSelect() {
    if (!inspectSelect) return;
    inspectSelect.innerHTML = "";
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const opt = document.createElement("option");
        opt.value = key(r, c);
        opt.textContent = isGoal(r, c) ? `(${r},${c}) terminal` : `(${r},${c})`;
        inspectSelect.appendChild(opt);
      }
    }
  }

  function updateInspect() {
    if (!inspectOut || !inspectSelect) return;
    const [r, c] = inspectSelect.value.split(",").map(Number);
    const g = evalState.gamma;
    if (isGoal(r, c)) {
      inspectOut.textContent = `Terminal goal state. By convention V(${r},${c}) = 0 (absorbing, no further reward).`;
      return;
    }
    const probs = pi(r, c);
    const lines = [];
    lines.push(`Bellman expectation at s=(${r},${c}), γ=${g.toFixed(2)}`);
    lines.push(`V(s) = Σ_a π(a|s) Σ_{s'} P(s'|s,a) [ R + γ V(s') ]`);
    lines.push(`(here P is deterministic given a; edges clip)`);
    lines.push("");
    let total = 0;
    ACTIONS.forEach((a, i) => {
      const n = nextState(r, c, a);
      const rew = reward(r, c, n.r, n.c);
      const cont = isGoal(n.r, n.c) ? 0 : evalState.V[n.r][n.c];
      const bracket = rew + g * cont;
      const contrib = probs[i] * bracket;
      total += contrib;
      lines.push(
        `a=${a.name}: π=${probs[i].toFixed(3)} × (${rew.toFixed(1)} + ${g.toFixed(2)}·${cont.toFixed(4)}) = ${contrib.toFixed(5)}`
      );
    });
    lines.push("");
    lines.push(`Σ = ${total.toFixed(5)}`);
    lines.push(`Current table V(${r},${c}) = ${evalState.V[r][c].toFixed(5)}`);
    lines.push(
      `Residual |backup − V| = ${Math.abs(total - evalState.V[r][c]).toFixed(5)} ` +
        `(zero ⇒ local fixed point for this s)`
    );
    inspectOut.textContent = lines.join("\n");
  }

  function resetEval() {
    evalState.V = emptyV();
    evalState.iter = 0;
    if (trace) {
      trace.textContent =
        "V reset to 0. Each sweep applies T^π synchronously to all non-terminal states.";
    }
    const d = document.getElementById("valDelta");
    if (d) d.textContent = "—";
    renderEval();
    updateInspect();
  }

  document.getElementById("valGamma")?.addEventListener("input", (e) => {
    evalState.gamma = Number(e.target.value);
    const lab = document.getElementById("valGammaLabel");
    if (lab) lab.textContent = evalState.gamma.toFixed(2);
    updateInspect();
  });

  document.getElementById("backupOnce")?.addEventListener("click", () => {
    const delta = backupOnce();
    const d = document.getElementById("valDelta");
    if (d) d.textContent = delta.toFixed(6) + (delta < 1e-6 ? " · converged" : "");
  });

  document.getElementById("backupMany")?.addEventListener("click", () => {
    let delta = 0;
    for (let i = 0; i < 20; i++) delta = backupOnce();
    if (trace && delta < 1e-6) {
      trace.textContent +=
        "\nConverged: additional sweeps may still increment iteration count, but visible values now change below display precision.";
    }
    const d = document.getElementById("valDelta");
    if (d) d.textContent = delta.toFixed(6) + (delta < 1e-6 ? " · converged" : "");
  });

  document.getElementById("resetV")?.addEventListener("click", () => {
    clearPiOverrides();
    resetEval();
  });

  inspectSelect?.addEventListener("change", updateInspect);

  fillSelect();
  resetEval();
  renderStudio();
  studioSolve();
})();
