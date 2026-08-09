/* Pearl — Chapter 03: Policy Iteration & Value Iteration lab */

(() => {
  "use strict";

  const N = 5;
  const ACTIONS = [
    { name: "↑", id: "U", dr: -1, dc: 0 },
    { name: "→", id: "R", dr: 0, dc: 1 },
    { name: "↓", id: "D", dr: 1, dc: 0 },
    { name: "←", id: "L", dr: 0, dc: -1 },
  ];
  const WALLS = new Set(["1,1", "1,2", "3,3"]);
  const GOAL = { r: 4, c: 4 };
  const PIT = { r: 2, c: 3 };
  // Match Chapter 01 laboratory so V values are comparable across chapters
  const STEP = -0.1;
  const GOAL_R = 10;
  const PIT_R = -5;
  const SLIP = 0.2;

  const S = {
    V: null,
    pi: null,
    gamma: 0.9,
    outer: 0,
    sweeps: 0,
    slip: false,
  };

  const gridEl = document.getElementById("dpGrid");
  const traceEl = document.getElementById("dpTrace");

  function key(r, c) {
    return `${r},${c}`;
  }
  function isWall(r, c) {
    return WALLS.has(key(r, c));
  }
  function isGoal(r, c) {
    return r === GOAL.r && c === GOAL.c;
  }
  function isPit(r, c) {
    return r === PIT.r && c === PIT.c;
  }
  function isTerminal(r, c) {
    return isGoal(r, c) || isPit(r, c);
  }

  function inBounds(r, c) {
    return r >= 0 && r < N && c >= 0 && c < N;
  }

  function move(r, c, a) {
    if (isTerminal(r, c) || isWall(r, c)) return { r, c };
    let nr = r + a.dr;
    let nc = c + a.dc;
    if (!inBounds(nr, nc) || isWall(nr, nc)) {
      nr = r;
      nc = c;
    }
    return { r: nr, c: nc };
  }

  function reward(r, c, nr, nc) {
    if (isTerminal(r, c)) return 0;
    if (isGoal(nr, nc)) return GOAL_R;
    if (isPit(nr, nc)) return PIT_R;
    return STEP;
  }

  /** Full one-step lookahead q(s,a) under current V — sums over P when slip is on. */
  function qSa(r, c, ai) {
    if (!S.slip) {
      const a = ACTIONS[ai];
      const n = move(r, c, a);
      const rew = reward(r, c, n.r, n.c);
      const vNext = isTerminal(n.r, n.c) ? 0 : S.V[n.r][n.c];
      return rew + S.gamma * vNext;
    }
    // Intended with 1−ε; each other action with ε/3 (same kernel as Ch 01)
    let q = 0;
    for (let j = 0; j < ACTIONS.length; j++) {
      const p = j === ai ? 1 - SLIP : SLIP / 3;
      const n = move(r, c, ACTIONS[j]);
      const rew = reward(r, c, n.r, n.c);
      const vNext = isTerminal(n.r, n.c) ? 0 : S.V[n.r][n.c];
      q += p * (rew + S.gamma * vNext);
    }
    return q;
  }

  function greedyAction(r, c) {
    let best = 0;
    let bestQ = -Infinity;
    let ties = 0;
    for (let ai = 0; ai < ACTIONS.length; ai++) {
      const q = qSa(r, c, ai);
      if (q > bestQ + 1e-12) {
        bestQ = q;
        best = ai;
        ties = 1;
      } else if (Math.abs(q - bestQ) <= 1e-12) {
        ties += 1;
        if (Math.random() < 1 / ties) best = ai;
      }
    }
    return best;
  }

  function init() {
    S.V = Array.from({ length: N }, () => Array(N).fill(0));
    S.pi = Array.from({ length: N }, () => Array(N).fill(1)); // default Right
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (isWall(r, c) || isTerminal(r, c)) S.pi[r][c] = -1;
      }
    }
    S.outer = 0;
    S.sweeps = 0;
    set("dpMode", "reset");
    set("dpCount", "0");
    set("dpDelta", "—");
    set("dpStable", "n/a");
    if (traceEl) {
      traceEl.textContent =
        "V=0, π defaults to →. Evaluate applies T^π; Improve sets π ← greedy(V); VI applies T*.";
    }
    render();
  }

  function set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function colorFor(v, vmax, vmin) {
    if (isNaN(v)) return "rgba(243,231,214,0.10)";
    const span = Math.max(vmax - vmin, 1e-6);
    const t = (v - vmin) / span;
    if (t >= 0.5) {
      const u = (t - 0.5) * 2;
      return `rgba(111, 155, 120, ${(0.12 + 0.5 * u).toFixed(3)})`;
    }
    const u = (0.5 - t) * 2;
    return `rgba(168, 90, 74, ${(0.1 + 0.45 * u).toFixed(3)})`;
  }

  function render() {
    if (!gridEl) return;
    const vals = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!isWall(r, c)) vals.push(S.V[r][c]);
      }
    }
    const vmax = Math.max(...vals, 0.01);
    const vmin = Math.min(...vals, -0.01);

    gridEl.innerHTML = "";
    gridEl.style.gridTemplateColumns = `repeat(${N}, 1fr)`;

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = document.createElement("div");
        cell.className = "dp-cell";

        if (isWall(r, c)) {
          cell.classList.add("wall");
          cell.textContent = "■■";
        } else if (isGoal(r, c)) {
          cell.classList.add("goal");
          cell.innerHTML = `<span class="dp-v">G</span><span class="dp-a">+1</span>`;
          cell.style.background = "rgba(111,155,120,0.35)";
        } else if (isPit(r, c)) {
          cell.classList.add("pit");
          cell.innerHTML = `<span class="dp-v">P</span><span class="dp-a">−1</span>`;
          cell.style.background = "rgba(168,90,74,0.35)";
        } else {
          const v = S.V[r][c];
          const ai = S.pi[r][c];
          const arrow = ai >= 0 ? ACTIONS[ai].name : "·";
          cell.style.background = colorFor(v, vmax, vmin);
          cell.innerHTML = `<span class="dp-v">${v.toFixed(3)}</span><span class="dp-a">${arrow}</span>`;
        }
        gridEl.appendChild(cell);
      }
    }
  }

  /** Synchronous policy evaluation sweeps until threshold or maxSweeps. */
  function evaluatePolicy(maxSweeps = 80, theta = 1e-4) {
    const lines = [];
    let delta = 0;
    let used = 0;
    for (let k = 0; k < maxSweeps; k++) {
      const Vnew = S.V.map((row) => row.slice());
      delta = 0;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (isWall(r, c) || isTerminal(r, c)) {
            Vnew[r][c] = 0;
            continue;
          }
          const ai = S.pi[r][c];
          const v = qSa(r, c, ai);
          delta = Math.max(delta, Math.abs(v - S.V[r][c]));
          Vnew[r][c] = v;
        }
      }
      S.V = Vnew;
      used = k + 1;
      S.sweeps += 1;
      if (delta < theta) break;
    }
    lines.push(`Policy evaluation: ${used} sweep(s), final ‖Δ‖∞=${delta.toFixed(6)}`);
    lines.push(
      S.slip
        ? `π fixed. Backup uses Σ_{s'} P(s'|s,π(s))[R+γV] with slip ε=${SLIP}.`
        : `π fixed. Deterministic P (slip OFF) — toggle slip to exercise the full transition sum.`
    );
    // show one cell
    const sr = 0;
    const sc = 0;
    if (!isTerminal(sr, sc)) {
      const ai = S.pi[sr][sc];
      const n = move(sr, sc, ACTIONS[ai]);
      lines.push(
        `Example s=(0,0) π→${ACTIONS[ai].name} lands (${n.r},${n.c})  V(0,0)=${S.V[0][0].toFixed(4)}`
      );
    }
    if (traceEl) traceEl.textContent = lines.join("\n");
    set("dpMode", "eval π");
    set("dpCount", `${S.outer} / ${S.sweeps}`);
    set("dpDelta", delta.toFixed(6) + (delta < 1e-6 ? " · converged" : ""));
    render();
    return delta;
  }

  function improvePolicy() {
    let stable = true;
    let changes = 0;
    const lines = [];
    lines.push(`Policy improvement (greedy w.r.t. current V), γ=${S.gamma.toFixed(2)}`);

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (isWall(r, c) || isTerminal(r, c)) continue;
        const old = S.pi[r][c];
        const neu = greedyAction(r, c);
        if (neu !== old) {
          stable = false;
          changes += 1;
          if (changes <= 6) {
            lines.push(
              `  (${r},${c}): ${ACTIONS[old].name} → ${ACTIONS[neu].name}  ` +
                `(Q_old=${qSa(r, c, old).toFixed(3)}, Q_new=${qSa(r, c, neu).toFixed(3)})`
            );
          }
        }
        S.pi[r][c] = neu;
      }
    }
    S.outer += 1;
    if (changes > 6) lines.push(`  … ${changes - 6} more state(s) changed`);
    lines.push(stable ? "π unchanged → local optimum (optimal for finite MDP)." : `π changed in ${changes} state(s). Re-evaluate next.`);
    if (traceEl) traceEl.textContent = lines.join("\n");
    set("dpMode", "improve π");
    set("dpCount", `${S.outer} / ${S.sweeps}`);
    set("dpStable", stable ? "yes · π*" : "no");
    render();
    return stable;
  }

  function valueIterationSweep() {
    const Vnew = S.V.map((row) => row.slice());
    let delta = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (isWall(r, c) || isTerminal(r, c)) {
          Vnew[r][c] = 0;
          continue;
        }
        let best = -Infinity;
        let bestAi = 0;
        for (let ai = 0; ai < ACTIONS.length; ai++) {
          const q = qSa(r, c, ai);
          if (q > best) {
            best = q;
            bestAi = ai;
          }
        }
        delta = Math.max(delta, Math.abs(best - S.V[r][c]));
        Vnew[r][c] = best;
        S.pi[r][c] = bestAi; // show greedy policy for visualization
      }
    }
    S.V = Vnew;
    S.sweeps += 1;
    return delta;
  }

  function runVI(times) {
    let delta = 0;
    for (let i = 0; i < times; i++) delta = valueIterationSweep();
    const lines = [];
    lines.push(`Value Iteration: ${times} sweep(s) of T*  (max over a of one-step backup)`);
    lines.push(`‖Δ‖∞=${delta.toFixed(6)}  γ=${S.gamma.toFixed(2)}`);
    lines.push(`Arrows show greedy policy w.r.t. current V (extracted each sweep for display).`);
    lines.push(`V(0,0)=${S.V[0][0].toFixed(4)}  V(near goal) shown on grid.`);
    if (delta < 1e-6) lines.push("Converged: further sweeps change less than 1e-6; the table may look static because the fixed point is already reached.");
    if (traceEl) traceEl.textContent = lines.join("\n");
    set("dpMode", "VI");
    set("dpCount", `— / ${S.sweeps}`);
    set("dpDelta", delta.toFixed(6) + (delta < 1e-6 ? " · converged" : ""));
    set("dpStable", delta < 1e-4 ? "≈ converged" : "running");
    render();
  }

  document.getElementById("dpGamma")?.addEventListener("input", (e) => {
    S.gamma = Number(e.target.value);
    const lab = document.getElementById("dpGammaLabel");
    if (lab) lab.textContent = S.gamma.toFixed(2);
  });

  document.getElementById("piEval")?.addEventListener("click", () => evaluatePolicy());
  document.getElementById("piImprove")?.addEventListener("click", () => improvePolicy());
  document.getElementById("piFull")?.addEventListener("click", () => {
    // One outer PI cycle: eval → improve → re-eval (not to full convergence)
    evaluatePolicy();
    const stable = improvePolicy();
    if (!stable) evaluatePolicy(40);
    if (traceEl) {
      traceEl.textContent +=
        "\n(Note: “Full PI step” = one outer iteration, not loop-until-π-stable.)";
    }
  });
  document.getElementById("viOnce")?.addEventListener("click", () => runVI(1));
  document.getElementById("viMany")?.addEventListener("click", () => runVI(25));
  document.getElementById("dpReset")?.addEventListener("click", init);
  document.getElementById("dpSlip")?.addEventListener("change", (e) => {
    S.slip = e.target.checked;
    if (traceEl) {
      traceEl.textContent = S.slip
        ? `Slip ON — backups use Σ_{s'} P(s'|s,a)[·] with ε=${SLIP}. Re-run eval/VI.`
        : "Slip OFF — deterministic transitions. Re-run eval/VI.";
    }
  });

  // grid CSS is in styles.css; set columns for 5×5
  if (gridEl) {
    gridEl.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
    gridEl.style.aspectRatio = "1";
  }

  init();
})();
