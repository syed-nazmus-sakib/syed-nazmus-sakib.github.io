/* Reward Models · RM Ch 14: hybrid rule-based + learned reward mixer */

(() => {
  "use strict";

  const L_MAX = 1000;
  const RESPONSES = [
    { id: "A", name: "plain and right", correct: 1, format: 1, rm: 0.55, len: 600 },
    { id: "B", name: "polished and wrong", correct: 0, format: 1, rm: 0.85, len: 1400 },
    { id: "C", name: "right, tags missing", correct: 1, format: 0, rm: 0.7, len: 350 }
  ];

  const PRESETS = {
    hybrid: { accOn: true, wAcc: 1, fmtOn: true, wFmt: 0.5, rmOn: true, wRm: 1, lenOn: true, lam: 0.5, gate: false },
    rm: { accOn: false, wAcc: 1, fmtOn: false, wFmt: 0.5, rmOn: true, wRm: 1, lenOn: false, lam: 0.5, gate: false },
    rules: { accOn: true, wAcc: 1, fmtOn: true, wFmt: 0.5, rmOn: false, wRm: 1, lenOn: true, lam: 0.5, gate: false },
    fmt: { accOn: false, wAcc: 1, fmtOn: true, wFmt: 0.5, rmOn: false, wRm: 1, lenOn: false, lam: 0.5, gate: false }
  };

  const el = (id) => document.getElementById(id);

  function set(id, v) {
    const node = el(id);
    if (node) node.textContent = v;
  }

  function num(id, fallback) {
    const v = Number(el(id)?.value);
    return Number.isFinite(v) ? v : fallback;
  }

  function checked(id, fallback) {
    const node = el(id);
    return node ? node.checked : fallback;
  }

  function readState() {
    return {
      accOn: checked("hybAccOn", true),
      wAcc: num("hybWAcc", 1),
      fmtOn: checked("hybFmtOn", true),
      wFmt: num("hybWFmt", 0.5),
      rmOn: checked("hybRmOn", true),
      wRm: num("hybWRm", 1),
      lenOn: checked("hybLenOn", true),
      lam: num("hybLam", 0.5),
      gate: checked("hybGate", false)
    };
  }

  function writeState(s) {
    const pairs = [
      ["hybAccOn", s.accOn], ["hybFmtOn", s.fmtOn], ["hybRmOn", s.rmOn],
      ["hybLenOn", s.lenOn], ["hybGate", s.gate]
    ];
    pairs.forEach(([id, v]) => {
      const node = el(id);
      if (node) node.checked = v;
    });
    const sliders = [["hybWAcc", s.wAcc], ["hybWFmt", s.wFmt], ["hybWRm", s.wRm], ["hybLam", s.lam]];
    sliders.forEach(([id, v]) => {
      const node = el(id);
      if (node) node.value = String(v);
    });
  }

  function fmtSigned(v) {
    const r = Math.abs(v) < 5e-10 ? 0 : v;
    return (r >= 0 ? "+" : "") + r.toFixed(2);
  }

  function score(resp, s) {
    const acc = s.accOn ? s.wAcc * resp.correct : 0;
    const fmt = s.fmtOn ? s.wFmt * resp.format : 0;
    const rm = s.rmOn ? s.wRm * resp.rm : 0;
    const len = s.lenOn ? (-s.lam * Math.max(0, resp.len - L_MAX)) / L_MAX : 0;
    const sum = acc + fmt + rm + len;
    const gated = s.gate && resp.format === 0;
    return { acc, fmt, rm, len, sum, total: gated ? 0 : sum, gated };
  }

  function ranking(rows) {
    const sorted = [...rows].sort((a, b) => b.total - a.total);
    let out = sorted[0].id;
    for (let i = 1; i < sorted.length; i++) {
      const tie = Math.abs(sorted[i].total - sorted[i - 1].total) < 1e-9;
      out += (tie ? " = " : " > ") + sorted[i].id;
    }
    return out;
  }

  function render() {
    const s = readState();
    set("hybWAccL", s.wAcc.toFixed(1));
    set("hybWFmtL", s.wFmt.toFixed(1));
    set("hybWRmL", s.wRm.toFixed(1));
    set("hybLamL", s.lam.toFixed(1));

    const rows = RESPONSES.map((r) => ({ ...r, ...score(r, s) }));
    rows.forEach((r) => set(`hybTot${r.id}`, r.total.toFixed(2)));
    const rank = ranking(rows);
    set("hybRank", rank);

    const lines = rows.map((r) => {
      const parts =
        `acc ${fmtSigned(r.acc)}  fmt ${fmtSigned(r.fmt)}  RM ${fmtSigned(r.rm)}  len ${fmtSigned(r.len)}`;
      const tail = r.gated ? `  sum ${r.sum.toFixed(2)} -> gated to 0.00` : `  = ${r.total.toFixed(2)}`;
      return `${r.id} (${r.name}): ${parts}${tail}`;
    });

    const best = [...rows].sort((a, b) => b.total - a.total)[0];
    const topTied = rows.filter((r) => Math.abs(r.total - best.total) < 1e-9);
    let verdict;
    if (topTied.length > 1) {
      verdict = `Tie at the top (${topTied.map((r) => r.id).join(", ")}): the reward cannot separate them.`;
    } else if (best.correct === 0) {
      verdict = `Top response ${best.id} is WRONG: this reward prefers style over correctness.`;
    } else {
      verdict = `Top response ${best.id} is correct.`;
    }

    const wrongMax = Math.max(...rows.filter((r) => r.correct === 0).map((r) => r.total));
    const rightMin = Math.min(...rows.filter((r) => r.correct === 1).map((r) => r.total));
    const sep = rightMin > wrongMax + 1e-9
      ? "Every correct response outranks every wrong one."
      : "Some correct response does not outrank the wrong one.";

    set("hybTrace", `${lines.join("\n")}\n\nRanking: ${rank}\n${verdict}\n${sep}`);
  }

  function applyPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    writeState(p);
    render();
  }

  ["hybAccOn", "hybFmtOn", "hybRmOn", "hybLenOn", "hybGate"].forEach((id) =>
    el(id)?.addEventListener("change", render)
  );
  ["hybWAcc", "hybWFmt", "hybWRm", "hybLam"].forEach((id) => el(id)?.addEventListener("input", render));
  el("hybPresetHybrid")?.addEventListener("click", () => applyPreset("hybrid"));
  el("hybPresetRm")?.addEventListener("click", () => applyPreset("rm"));
  el("hybPresetRules")?.addEventListener("click", () => applyPreset("rules"));
  el("hybPresetFmt")?.addEventListener("click", () => applyPreset("fmt"));

  render();
})();
