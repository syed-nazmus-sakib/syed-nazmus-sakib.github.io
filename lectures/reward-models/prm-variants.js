/* Reward Models · RM Ch 15: step-score aggregation and one bad step */

(() => {
  "use strict";

  const N = 5;
  const PRESETS = {
    clean: [0.95, 0.9, 0.92, 0.9, 0.95],
    flat: [0.8, 0.8, 0.8, 0.8, 0.8],
    fade: [0.97, 0.9, 0.8, 0.7, 0.6]
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

  function readState() {
    const q = [];
    for (let i = 1; i <= N; i++) q.push(num(`pvQ${i}`, PRESETS.clean[i - 1]));
    return {
      q,
      bad: el("pvBad")?.checked ?? false,
      pos: Math.min(N, Math.max(1, Math.round(num("pvBadPos", 3)))),
      badVal: num("pvBadVal", 0.1)
    };
  }

  function aggregate(q) {
    const prod = q.reduce((a, b) => a * b, 1);
    const mlog = q.reduce((a, b) => a + Math.log(b), 0) / q.length;
    return {
      min: Math.min(...q),
      prod,
      mlog,
      geo: Math.exp(mlog),
      mean: q.reduce((a, b) => a + b, 0) / q.length,
      last: q[q.length - 1]
    };
  }

  function render() {
    const s = readState();
    for (let i = 1; i <= N; i++) set(`pvQ${i}L`, s.q[i - 1].toFixed(2));
    set("pvBadPosL", String(s.pos));
    set("pvBadValL", s.badVal.toFixed(2));

    const clean = s.q;
    const used = s.bad ? clean.map((v, i) => (i === s.pos - 1 ? s.badVal : v)) : clean;
    const a = aggregate(used);
    const c = aggregate(clean);

    set("pvMin", a.min.toFixed(3));
    set("pvProd", a.prod.toFixed(3));
    set("pvMlog", `${a.mlog.toFixed(3)} (${a.geo.toFixed(3)})`);
    set("pvMean", a.mean.toFixed(3));
    set("pvLast", a.last.toFixed(3));

    const vec = (v) => `[${v.map((x) => x.toFixed(2)).join(", ")}]`;
    if (!s.bad) {
      set(
        "pvTrace",
        `q = ${vec(clean)}\n` +
          `min ${c.min.toFixed(3)}   product ${c.prod.toFixed(3)}   mean log ${c.mlog.toFixed(3)} (geo ${c.geo.toFixed(3)})\n` +
          `mean ${c.mean.toFixed(3)}   last ${c.last.toFixed(3)}\n\n` +
          `Order check: product ${c.prod.toFixed(3)} <= min ${c.min.toFixed(3)} <= geo ${c.geo.toFixed(3)} <= mean ${c.mean.toFixed(3)}.\n` +
          `Turn on "Inject a bad step" to see which aggregations react.`
      );
      return;
    }

    const rows = [
      { name: "min", before: c.min, after: a.min },
      { name: "product", before: c.prod, after: a.prod },
      { name: "geo (exp mean log)", before: c.geo, after: a.geo },
      { name: "mean", before: c.mean, after: a.mean },
      { name: "last step", before: c.last, after: a.last }
    ].map((r) => ({ ...r, keep: r.before > 0 ? r.after / r.before : 1 }));

    const lines = rows.map((r) => {
      const pct = ((1 - r.keep) * 100).toFixed(0);
      const note = Math.abs(r.after - r.before) < 1e-9 ? "unchanged" : `keeps ${(r.keep * 100).toFixed(0)}%, drops ${pct}%`;
      return `${r.name.padEnd(19)} ${r.before.toFixed(3)} -> ${r.after.toFixed(3)}   ${note}`;
    });

    const order = [...rows].sort((x, y) => x.keep - y.keep).map((r) => r.name);
    const replaced = clean[s.pos - 1];
    const header =
      `clean q = ${vec(clean)}\n` +
      `bad   q = ${vec(used)}   (step ${s.pos}: ${replaced.toFixed(2)} -> ${s.badVal.toFixed(2)})\n`;
    const tail =
      replaced <= s.badVal
        ? "\nThe chosen step is already at or below the bad score, so nothing changes."
        : `\nMost to least punishing: ${order.join(" > ")}.`;

    set("pvTrace", `${header}\n${lines.join("\n")}${tail}`);
  }

  function applyPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    p.forEach((v, i) => {
      const node = el(`pvQ${i + 1}`);
      if (node) node.value = String(v);
    });
    render();
  }

  for (let i = 1; i <= N; i++) el(`pvQ${i}`)?.addEventListener("input", render);
  el("pvBad")?.addEventListener("change", render);
  el("pvBadPos")?.addEventListener("input", render);
  el("pvBadVal")?.addEventListener("input", render);
  el("pvPresetClean")?.addEventListener("click", () => applyPreset("clean"));
  el("pvPresetFlat")?.addEventListener("click", () => applyPreset("flat"));
  el("pvPresetFade")?.addEventListener("click", () => applyPreset("fade"));

  render();
})();
