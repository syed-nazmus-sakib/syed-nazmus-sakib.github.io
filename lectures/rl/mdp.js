/* Pearl — MDP lesson interactions + gridworld */

(() => {
  "use strict";

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const fmt = (n, d = 3) => Number(n).toFixed(d);
  const keyOf = (r, c) => `${r},${c}`;

  // ------------------------------------------------------------------
  // 1. Loop pulse
  // ------------------------------------------------------------------
  const loopNodes = $$(".loop-node");
  let loopIdx = 0;
  if (loopNodes.length) {
    setInterval(() => {
      loopNodes.forEach((n) => n.classList.remove("active"));
      loopNodes[loopIdx % loopNodes.length].classList.add("active");
      loopIdx += 1;
    }, 1100);
  }

  // ------------------------------------------------------------------
  // 2. Tuple explorer
  // ------------------------------------------------------------------
  const TUPLE_COPY = {
    S: {
      title: "S — state space",
      body: `Finite set of information states the agent can occupy. Tabular methods store one entry per s ∈ S. In the laboratory grid, |S|=25 (cells). In robotics S ⊂ R^n is continuous — the same MDP tuple applies, but algorithms must approximate functions over S.`,
      extra: `Design criterion: S should be Markovian. If two histories that require different futures share a label s, Bellman equations written in s are false for the real process.`,
    },
    A: {
      title: "A — action space",
      body: `Set of controls. Discrete A enables argmax_a Q(s,a). Continuous A makes that argmax an inner optimization, which is a primary reason to learn π_θ(a|s) directly (policy gradients).`,
      extra: `Formally a ∈ A or a ∈ A(s). Constrained action sets (joint limits) are part of the MDP definition, not an afterthought.`,
    },
    P: {
      title: "P — transition kernel",
      body: `P(s′|s,a) ∈ [0,1] with Σ_{s′} P(s′|s,a)=1. Encodes stochastic dynamics. DP requires the full table; model-free RL only samples s′∼P(·|s,a) via interaction.`,
      extra: `Closed-loop chain under π: P^π(s′|s)=Σ_a π(a|s) P(s′|s,a). Occupancy measures and policy gradients are expectations under trajectories of this kernel.`,
    },
    R: {
      title: "R — reward function",
      body: `Bounded scalar score for transitions. May be written R(s,a), R(s,a,s′), or expected reward R̄(s,a). The objective is expected discounted sum of R — not “looking intelligent.”`,
      extra: `Misspecified R ⇒ correct optimization of the wrong task (reward hacking). Changing R changes the MDP.`,
    },
    G: {
      title: "γ — discount factor",
      body: `γ ∈ [0,1) ensures |G_t| ≤ R_max/(1−γ) and induces effective horizon ∼1/(1−γ). Also the contraction modulus of Bellman operators (Chapter 02).`,
      extra: `γ→1: long-sighted, slower contraction, harder credit assignment. γ→0: myopic. Deep RL often uses 0.99.`,
    },
  };

  const tuplePanel = $("#tuplePanel");
  const tupleCards = $$(".tuple-card");

  function showTuple(key) {
    const data = TUPLE_COPY[key];
    if (!data || !tuplePanel) return;
    tuplePanel.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.body}</p>
      <p><code>${data.extra}</code></p>
    `;
    tupleCards.forEach((card) => {
      const on = card.dataset.key === key;
      card.classList.toggle("active", on);
      card.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  tupleCards.forEach((card) => {
    card.addEventListener("click", () => showTuple(card.dataset.key));
  });
  showTuple("S");

  // ------------------------------------------------------------------
  // 3. Return walkthrough (toy rewards)
  // ------------------------------------------------------------------
  const toyRewards = [-0.1, -0.1, -0.1, 10];
  const gammaSlider = $("#gammaSlider");
  const gammaVal = $("#gammaVal");
  const rewardChips = $("#rewardChips");
  const returnSteps = $("#returnSteps");
  const returnTotal = $("#returnTotal");

  function renderRewardChips() {
    if (!rewardChips) return;
    rewardChips.innerHTML = toyRewards
      .map(
        (r, i) =>
          `<button type="button" class="reward-chip active" data-i="${i}">r<sub>${i + 1}</sub>=${r}</button>`
      )
      .join("");
  }

  function renderReturnMath() {
    if (!returnSteps || !gammaSlider) return;
    const g = Number(gammaSlider.value);
    if (gammaVal) gammaVal.textContent = g.toFixed(2);

    const terms = toyRewards.map((r, k) => r * g ** k);
    const G = terms.reduce((a, b) => a + b, 0);

    returnSteps.innerHTML = `
      <li>Episode rewards: r = [${toyRewards.join(", ")}]</li>
      <li>Expand: G₀ = Σ<sub>k</sub> γ<sup>k</sup> r<sub>k+1</sub></li>
      ${toyRewards
        .map((r, k) => {
          const w = g ** k;
          return `<li>Term k=${k}: γ<sup>${k}</sup>·(${r}) = ${fmt(w, 3)} · (${r}) = <span style="color:var(--sugar-bright)">${fmt(terms[k])}</span></li>`;
        })
        .join("")}
    `;
    returnTotal.innerHTML = `G₀ = ${terms.map((t) => fmt(t)).join(" + ")} = <strong>${fmt(G)}</strong>`;
  }

  renderRewardChips();
  renderReturnMath();
  gammaSlider?.addEventListener("input", renderReturnMath);

  // ------------------------------------------------------------------
  // 4. Markov property mini-demo
  // ------------------------------------------------------------------
  function mountMarkov() {
    const bad = $("#markovBad");
    const good = $("#markovGood");
    if (!bad || !good) return;

    bad.innerHTML = `
      <div class="trail"></div>
      <div class="ball" id="ballBad"></div>
      <div class="vel-arrow" style="left:55%;color:var(--pit)">? velocity</div>
    `;
    good.innerHTML = `
      <div class="trail"></div>
      <div class="ball" id="ballGood"></div>
      <div class="vel-arrow" id="velLabel" style="left:48%">v →</div>
    `;

    let t = 0;
    setInterval(() => {
      t += 0.04;
      const ballBad = $("#ballBad");
      const ballGood = $("#ballGood");
      const velLabel = $("#velLabel");
      if (!ballBad || !ballGood) return;

      // Broken: ambiguous future from position alone
      const phase = Math.floor(t / Math.PI) % 2;
      ballBad.style.left = `${42 + Math.sin(t * 1.2) * 4}%`;
      ballBad.style.opacity = phase ? "1" : "0.55";

      // Fixed: position + explicit velocity
      const x = 20 + ((Math.sin(t) + 1) / 2) * 55;
      const vx = Math.cos(t);
      ballGood.style.left = `${x}%`;
      if (velLabel) {
        velLabel.textContent = vx >= 0 ? "v →" : "← v";
        velLabel.style.left = `${clamp(x + 8, 10, 80)}%`;
      }
    }, 32);
  }
  mountMarkov();

  // ------------------------------------------------------------------
  // 5. Gridworld MDP
  // ------------------------------------------------------------------
  const ROWS = 5;
  const COLS = 5;
  const ACTIONS = {
    up: { dr: -1, dc: 0, name: "Up" },
    down: { dr: 1, dc: 0, name: "Down" },
    left: { dr: 0, dc: -1, name: "Left" },
    right: { dr: 0, dc: 1, name: "Right" },
  };
  const ACTION_KEYS = Object.keys(ACTIONS);

  const WALLS = new Set([keyOf(1, 1), keyOf(1, 2), keyOf(3, 3)]);
  const GOAL = { r: 4, c: 4 };
  const PIT = { r: 2, c: 3 };
  const START = { r: 0, c: 0 };
  const STEP_COST = -0.1;
  const GOAL_R = 10;
  const PIT_R = -5;
  const SLIP = 0.2;

  const state = {
    r: START.r,
    c: START.c,
    step: 0,
    rewards: [],
    done: false,
    slip: false,
    gamma: 0.9,
    autoTimer: null,
  };

  const gridEl = $("#grid");
  const transitionViz = $("#transitionViz");
  const episodeLog = $("#episodeLog");
  const gFormula = $("#gFormula");

  function inBounds(r, c) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
  }

  function isWall(r, c) {
    return WALLS.has(keyOf(r, c));
  }

  function isTerminal(r, c) {
    return (r === GOAL.r && c === GOAL.c) || (r === PIT.r && c === PIT.c);
  }

  function rewardAt(r, c) {
    if (r === GOAL.r && c === GOAL.c) return GOAL_R;
    if (r === PIT.r && c === PIT.c) return PIT_R;
    return STEP_COST;
  }

  function intendedNext(r, c, action) {
    const { dr, dc } = ACTIONS[action];
    let nr = r + dr;
    let nc = c + dc;
    if (!inBounds(nr, nc) || isWall(nr, nc)) {
      nr = r;
      nc = c;
    }
    return { r: nr, c: nc };
  }

  /** Exact P(.|s,a) over next cells (including stay-on-bump). */
  function transitionDist(r, c, action) {
    const dist = new Map();
    const add = (nr, nc, p) => {
      const k = keyOf(nr, nc);
      dist.set(k, (dist.get(k) || 0) + p);
    };

    if (!state.slip) {
      const n = intendedNext(r, c, action);
      add(n.r, n.c, 1);
      return dist;
    }

    const intended = action;
    ACTION_KEYS.forEach((a) => {
      const p = a === intended ? 1 - SLIP : SLIP / 3;
      const n = intendedNext(r, c, a);
      add(n.r, n.c, p);
    });
    return dist;
  }

  function sampleNext(r, c, action) {
    const dist = transitionDist(r, c, action);
    let roll = Math.random();
    for (const [k, p] of dist) {
      roll -= p;
      if (roll <= 0) {
        const [nr, nc] = k.split(",").map(Number);
        return { r: nr, c: nc, dist };
      }
    }
    const last = [...dist.keys()].pop();
    const [nr, nc] = last.split(",").map(Number);
    return { r: nr, c: nc, dist };
  }

  function computeG0(rewards, gamma) {
    return rewards.reduce((acc, r, k) => acc + r * gamma ** k, 0);
  }

  function renderGrid() {
    if (!gridEl) return;
    gridEl.innerHTML = "";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.setAttribute("role", "gridcell");
        cell.dataset.rc = keyOf(r, c);

        if (isWall(r, c)) {
          cell.classList.add("wall");
          cell.textContent = "■■";
        } else if (r === GOAL.r && c === GOAL.c) {
          cell.classList.add("goal");
          cell.textContent = "+10";
        } else if (r === PIT.r && c === PIT.c) {
          cell.classList.add("pit");
          cell.textContent = "−5";
        } else {
          cell.textContent = `(${r},${c})`;
        }

        if (r === state.r && c === state.c && !isWall(r, c)) {
          cell.classList.add("agent");
          const dot = document.createElement("div");
          dot.className = "agent-dot";
          cell.textContent = "";
          if (r === GOAL.r && c === GOAL.c) {
            cell.insertAdjacentHTML("beforeend", `<span style="position:absolute;top:6px;font-size:0.55rem;color:var(--goal)">GOAL</span>`);
          }
          cell.appendChild(dot);
        }

        gridEl.appendChild(cell);
      }
    }
  }

  function updateStats() {
    const g = computeG0(state.rewards, state.gamma);
    const sumR = state.rewards.reduce((a, b) => a + b, 0);
    $("#statState").textContent = `(${state.r},${state.c})`;
    $("#statStep").textContent = String(state.step);
    $("#statSumR").textContent = fmt(sumR, 2);
    $("#statG").textContent = fmt(g, 3);
  }

  function renderGBuild() {
    if (!gFormula) return;
    if (!state.rewards.length) {
      gFormula.textContent = "— take steps to assemble G₀ = Σ γᵏ rₖ₊₁";
      return;
    }
    const g = state.gamma;
    const parts = state.rewards.map((r, k) => {
      const term = r * g ** k;
      return `(${fmt(g, 2)})^${k}·(${r})=${fmt(term, 3)}`;
    });
    const total = computeG0(state.rewards, g);
    gFormula.innerHTML = `${parts.join("<br/>+")}<br/><span style="color:var(--foam)">= G₀ = <strong>${fmt(total, 4)}</strong></span>`;
  }

  function describeTransition(prev, action, next, reward, dist, slipped) {
    if (!transitionViz) return;
    const rows = [...dist.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([k, p]) => {
        const mark = k === keyOf(next.r, next.c) ? " ← sampled" : "";
        return `  P(${k} | s, ${ACTIONS[action].name}) = ${fmt(p, 3)}${mark}`;
      })
      .join("\n");

    transitionViz.innerHTML = `
      <div><span class="hl">s</span> = (${prev.r},${prev.c}) &nbsp; <span class="hl">a</span> = ${ACTIONS[action].name}${slipped ? " <span class=\"hl\">(slip world)</span>" : ""}</div>
      <div style="margin:0.45rem 0;white-space:pre-wrap">${rows}</div>
      <div><span class="hl">s′</span> = (${next.r},${next.c}) &nbsp; <span class="hl">r</span> = ${reward}</div>
      <div style="margin-top:0.45rem">Bellman one-step sketch (later lessons fill V):</div>
      <div>target ≈ r + γ V(s′) &nbsp; with γ = ${fmt(state.gamma, 2)}</div>
    `;
  }

  function logStep(prev, action, next, reward) {
    if (!episodeLog) return;
    const li = document.createElement("li");
    li.textContent = `t=${state.step - 1}: (${prev.r},${prev.c}) —${ACTIONS[action].name}→ (${next.r},${next.c})  r=${reward}`;
    episodeLog.prepend(li);
  }

  function flashCell(r, c) {
    const el = gridEl?.querySelector(`[data-rc="${keyOf(r, c)}"]`);
    if (!el) return;
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  }

  function takeAction(action) {
    if (state.done) return;
    if (!ACTIONS[action]) return;

    const prev = { r: state.r, c: state.c };
    const { r: nr, c: nc, dist } = sampleNext(prev.r, prev.c, action);
    const reward = rewardAt(nr, nc);

    state.r = nr;
    state.c = nc;
    state.step += 1;
    state.rewards.push(reward);

    if (isTerminal(nr, nc)) state.done = true;

    renderGrid();
    flashCell(nr, nc);
    updateStats();
    renderGBuild();
    describeTransition(prev, action, { r: nr, c: nc }, reward, dist, state.slip);
    logStep(prev, action, { r: nr, c: nc }, reward);

    if (state.done) {
      const g = computeG0(state.rewards, state.gamma);
      if (transitionViz) {
        transitionViz.innerHTML += `<div style="margin-top:0.6rem;color:var(--pearl-mint)">Episode ended. Final G₀ = <strong>${fmt(g, 4)}</strong>. Reset to sample another trajectory.</div>`;
      }
      stopAuto();
    }
  }

  function resetEpisode() {
    stopAuto();
    state.r = START.r;
    state.c = START.c;
    state.step = 0;
    state.rewards = [];
    state.done = false;
    renderGrid();
    updateStats();
    renderGBuild();
    if (transitionViz) {
      transitionViz.innerHTML = `<p class="empty-hint">Take an action. We’ll write out P, R, and the running return.</p>`;
    }
  }

  function stopAuto() {
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
      const btn = $("#autoPlay");
      if (btn) btn.textContent = "Auto-walk";
    }
  }

  function toggleAuto() {
    if (state.autoTimer) {
      stopAuto();
      return;
    }
    const btn = $("#autoPlay");
    if (btn) btn.textContent = "Stop";
    state.autoTimer = setInterval(() => {
      if (state.done) {
        resetEpisode();
      }
      // greedy-ish toward goal with noise
      const options = ACTION_KEYS.slice();
      const prefer = [];
      if (state.c < GOAL.c) prefer.push("right");
      if (state.r < GOAL.r) prefer.push("down");
      if (state.c > GOAL.c) prefer.push("left");
      if (state.r > GOAL.r) prefer.push("up");
      const pool = prefer.length && Math.random() < 0.75 ? prefer : options;
      const a = pool[Math.floor(Math.random() * pool.length)];
      takeAction(a);
    }, 550);
  }

  // Wire controls
  $$(".dpad button").forEach((btn) => {
    btn.addEventListener("click", () => takeAction(btn.dataset.action));
  });

  $("#slipToggle")?.addEventListener("change", (e) => {
    state.slip = e.target.checked;
  });

  const demoGamma = $("#demoGamma");
  const demoGammaVal = $("#demoGammaVal");
  demoGamma?.addEventListener("input", () => {
    state.gamma = Number(demoGamma.value);
    if (demoGammaVal) demoGammaVal.textContent = state.gamma.toFixed(2);
    updateStats();
    renderGBuild();
  });

  $("#resetEpisode")?.addEventListener("click", resetEpisode);
  $("#autoPlay")?.addEventListener("click", toggleAuto);
  $("#clearLog")?.addEventListener("click", () => {
    if (episodeLog) episodeLog.innerHTML = "";
  });
  $("#scrollToDemo")?.addEventListener("click", () => {
    $("#demo")?.scrollIntoView({ behavior: "smooth" });
  });

  // Keyboard
  window.addEventListener("keydown", (e) => {
    const map = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      W: "up",
      s: "down",
      S: "down",
      a: "left",
      A: "left",
      d: "right",
      D: "right",
    };
    const action = map[e.key];
    if (!action) return;
    const demo = $("#demo");
    if (!demo) return;
    const rect = demo.getBoundingClientRect();
    const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
    if (!onScreen) return;
    e.preventDefault();
    takeAction(action);
  });

  renderGrid();
  updateStats();
  renderGBuild();

  // ------------------------------------------------------------------
  // 6. Worked example reveal
  // ------------------------------------------------------------------
  let revealIdx = 0;
  const workedSteps = $$("#workedSteps li");

  function revealWorked(n) {
    workedSteps.forEach((li, i) => {
      li.classList.toggle("show", i < n);
      li.classList.toggle("hidden-step", i >= n);
    });
  }

  $("#revealNext")?.addEventListener("click", () => {
    revealIdx = clamp(revealIdx + 1, 0, workedSteps.length);
    revealWorked(revealIdx);
  });
  $("#revealAll")?.addEventListener("click", () => {
    revealIdx = workedSteps.length;
    revealWorked(revealIdx);
  });
  revealWorked(0);

  // ------------------------------------------------------------------
  // 7. Slip sampling chart
  // ------------------------------------------------------------------
  // Interior cell (2,1): Right→(2,2), Up hits wall at (1,1) → stay, Down→(3,1), Left→(2,0)
  let outcomeCounts = {};

  function renderSlipChart() {
    const chart = $("#slipChart");
    const caption = $("#slipCaption");
    if (!chart) return;
    const total = Object.values(outcomeCounts).reduce((a, b) => a + b, 0);
    const entries = Object.entries(outcomeCounts).sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
      chart.innerHTML = "";
      if (caption) caption.textContent = "No samples yet.";
      return;
    }
    chart.innerHTML = entries
      .map(([label, count]) => {
        const pct = total ? (100 * count) / total : 0;
        return `<div class="bar-row">
          <span>${label}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <span>${count} (${fmt(pct, 0)}%)</span>
        </div>`;
      })
      .join("");
    if (caption) {
      caption.textContent =
        total < 20
          ? `${total} samples — distribution still noisy.`
          : `${total} samples — should approach ~80% intended, ~6.7% each slip (stay if wall).`;
    }
  }

  function sampleSlips(n = 20) {
    const sr = 2;
    const sc = 1;
    const intended = "right";
    // temporarily force slip logic
    const prevSlip = state.slip;
    state.slip = true;
    for (let i = 0; i < n; i++) {
      const { r, c } = (() => {
        // sample using same kernel as env
        const dist = (() => {
          const d = new Map();
          const add = (nr, nc, p) => {
            const k = keyOf(nr, nc);
            d.set(k, (d.get(k) || 0) + p);
          };
          ACTION_KEYS.forEach((a) => {
            const p = a === intended ? 1 - SLIP : SLIP / 3;
            const n = intendedNext(sr, sc, a);
            add(n.r, n.c, p);
          });
          return d;
        })();
        let roll = Math.random();
        for (const [k, p] of dist) {
          roll -= p;
          if (roll <= 0) {
            const [nr, nc] = k.split(",").map(Number);
            return { r: nr, c: nc };
          }
        }
        const [nr, nc] = [...dist.keys()].pop().split(",").map(Number);
        return { r: nr, c: nc };
      })();

      let label;
      if (r === sr && c === sc + 1) label = "intended (2,2)";
      else if (r === sr && c === sc) label = "stay (wall/edge)";
      else if (r === sr + 1 && c === sc) label = "slip down (3,1)";
      else if (r === sr && c === sc - 1) label = "slip left (2,0)";
      else label = `other (${r},${c})`;

      outcomeCounts[label] = (outcomeCounts[label] || 0) + 1;
    }
    state.slip = prevSlip;
    renderSlipChart();
  }

  $("#sampleSlips")?.addEventListener("click", () => sampleSlips(20));
  $("#resetSlips")?.addEventListener("click", () => {
    outcomeCounts = {};
    renderSlipChart();
  });
  renderSlipChart();

  // Typeset MathJax after dynamic bits if needed
  window.addEventListener("load", () => {
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise().catch(() => {});
    }
  });
})();
