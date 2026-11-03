/* Blueprint · Lecture 01 — Lab 01 "Rays, pixels & parallax" + checkpoint quiz.
   Benches:
     A · The same pixel, many points   (scale ambiguity along one ray)
     B · Triangulation under error     (Z = fB/d and its sensitivity)
     C · The ambiguity machine         (world motion vs camera motion)
   Vanilla JS, defensive lookups, matches the house lab style. */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const fmtFixed = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : "—");

  /* ------------------------------------------------------------ A · ray */
  const stageA = $("stageA");
  if (stageA) {
    const F = $("aF");
    const Z = $("aZ");
    const valF = $("aFVal");
    const valZ = $("aZVal");
    const outX = $("aXOut");
    const outU = $("aUOut");
    const hiA = $("aRayHi");
    const hiLbl = $("aRayHiLbl");
    const squares = [...stageA.querySelectorAll("g[data-z]")];
    const CAM_X = 95;
    const CAM_Y = 152;
    const END_X = 610;
    const END_Y = 60;

    const render = () => {
      const f = parseFloat(F?.value ?? "800");
      const z = parseFloat(Z?.value ?? "4");
      const slope = 100 / f; // (u - c_x) / f_x with u = 740, c_x = 640
      const xOfZ = z * slope;

      if (valF) valF.textContent = `${f} px`;
      if (valZ) valZ.textContent = `${fmtFixed(z, 1)} m`;
      if (outX) outX.textContent = `${fmtFixed(xOfZ, 3)} m`;
      if (outU) outU.textContent = `740 px`;

      // squares scale with X = 100·Z/f ; reference size at (Z=24, current f)
      const xMax = 24 * slope;
      squares.forEach((g) => {
        const zt = parseFloat(g.dataset.z || "0");
        const xx = zt * slope;
        const px = 210 + (zt / 24) * 340;
        const py = CAM_Y + ((END_Y - CAM_Y) * (px - CAM_X)) / (END_X - CAM_X);
        const r = g.querySelector("rect");
        const lbl = g.querySelector("text");
        const half = 5 + 46 * (xMax ? xx / xMax : 0.1);
        const above = g.dataset.labelDir === "above";
        if (r) {
          r.setAttribute("x", fmtFixed(px - half, 1));
          r.setAttribute("y", fmtFixed(py - half, 1));
          r.setAttribute("width", fmtFixed(half * 2, 1));
          r.setAttribute("height", fmtFixed(half * 2, 1));
        }
        if (lbl) {
          lbl.setAttribute("x", fmtFixed(px, 1));
          lbl.setAttribute(
            "y",
            fmtFixed(above ? py - half - 12 : py + half + 16, 1)
          );
          lbl.textContent = `(${fmtFixed(xx, 2)} m, ${fmtFixed(zt, 0)} m)`;
        }
      });

      const xHi = 210 + (z / 24) * 340;
      const yHi = CAM_Y + ((END_Y - CAM_Y) * (xHi - CAM_X)) / (END_X - CAM_X);
      hiA?.setAttribute("cx", fmtFixed(xHi, 1));
      hiA?.setAttribute("cy", fmtFixed(yHi, 1));
      if (hiLbl) {
        hiLbl.setAttribute("x", fmtFixed(xHi + 12, 1));
        hiLbl.setAttribute("y", fmtFixed(yHi - 12, 1));
        hiLbl.textContent = `your Z = ${fmtFixed(z, 1)} m`;
      }
      const slopeTxt = $("aSlopeTxt");
      if (slopeTxt) slopeTxt.textContent = `X(Z) = ${(100 / f).toFixed(4)}·Z`;
    };

    F?.addEventListener("input", render);
    Z?.addEventListener("input", render);
    render();
  }

  /* ------------------------------------------------------------ B · stereo */
  const stageB = $("stageB");
  if (stageB) {
    const F = $("bF");
    const B = $("bB");
    const D = $("bD");
    const valF = $("bFVal");
    const valB = $("bBVal");
    const valD = $("bDVal");
    const outZ = $("bZOut");
    const outS = $("bSensOut");
    const outE = $("bErrOut");
    const pDot = $("bPoint");
    const rayL = $("bRayL");
    const rayR = $("bRayR");
    const lblZ = $("bZLbl");
    const TOP_Y = 42;
    const RANGE = 160;

    const render = () => {
      const f = parseFloat(F?.value ?? "800");
      const b = parseFloat(B?.value ?? "0.2");
      const d = parseFloat(D?.value ?? "40");
      const zq = (f * b) / d;
      const sens = (f * b) / (d * d);
      const err = sens * 2;

      if (valF) valF.textContent = `${f} px`;
      if (valB) valB.textContent = `${fmtFixed(b, 2)} m`;
      if (valD) valD.textContent = `${fmtFixed(d, 0)} px`;
      if (outZ) outZ.textContent = `${fmtFixed(zq, 2)} m`;
      if (outS) outS.textContent = `${fmtFixed(sens, 3)} m/px`;
      if (outE) outE.textContent = `± ${fmtFixed(err, 2)} m`;

      const py = TOP_Y + Math.min(1, zq / 24) * RANGE;
      rayL?.setAttribute("x2", 310);
      rayL?.setAttribute("y2", fmtFixed(py, 1));
      rayR?.setAttribute("x2", 310);
      rayR?.setAttribute("y2", fmtFixed(py, 1));
      pDot?.setAttribute("cy", fmtFixed(py, 1));
      if (lblZ) {
        lblZ.setAttribute("y", fmtFixed(py + 18, 1));
        lblZ.textContent = `P · depth Z ≈ ${fmtFixed(zq, 2)} m`;
      }
    };

    F?.addEventListener("input", render);
    B?.addEventListener("input", render);
    D?.addEventListener("input", render);
    render();
  }

  /* ------------------------------------------------- C · ambiguity machine */
  const C_D = $("cD");
  const C_S = $("cS");
  if (C_D) {
    const valD = $("cDVal");
    const valS = $("cSVal");
    const worldEl = $("cWorld");
    const camEl = $("cCam");
    const rows = [...document.querySelectorAll("[data-split]")];
    const CHECK = $("cCheck");

    // scene: f_x = 800, c_x = 640, X = 1 m, Z = 10 m -> u0 = 720
    const F = 800;
    const Z = 10;

    const render = () => {
      const du = parseFloat(C_D?.value ?? "12");
      const s = parseFloat(C_S?.value ?? "0") / 100; // 0 = camera, 1 = world
      const delta = (du * Z) / F; // δ_w − δ_c
      const dw = s * delta;
      const dc = -(1 - s) * delta; // negative = camera moves left

      if (valD) valD.textContent = `${fmtFixed(du, 0)} px`;
      if (valS) valS.textContent = `${fmtFixed(s * 100, 0)} % world`;

      if (worldEl)
        worldEl.textContent =
          Math.abs(dw) < 0.005 ? "stationary" : `${fmtFixed(dw, 3)} m right`;
      if (camEl)
        camEl.textContent =
          Math.abs(dc) < 0.005 ? "stationary" : `${fmtFixed(-dc, 3)} m left`;

      rows.forEach((row) => {
        const sw = parseFloat(row.dataset.split || "0");
        const dww = sw * delta;
        const dcc = -(1 - sw) * delta;
        const wl = row.querySelector("[data-world]");
        const cl = row.querySelector("[data-cam]");
        const bw = row.querySelector("[data-barw]");
        const bc = row.querySelector("[data-barc]");
        if (wl)
          wl.textContent =
            Math.abs(dww) < 0.005 ? "still" : `${fmtFixed(dww, 3)} m →`;
        if (cl)
          cl.textContent =
            Math.abs(dcc) < 0.005 ? "still" : `${fmtFixed(-dcc, 3)} m ←`;
        if (bw && bc) {
          bw.style.width = `${Math.abs(sw) * 88}%`;
          bc.style.width = `${Math.abs(1 - sw) * 88}%`;
        }
        const same = row.querySelector("[data-same]");
        if (same) same.textContent = `Δu = ${fmtFixed(du, 0)} px`;
      });

      if (CHECK)
        CHECK.textContent = `check: u′ = 800·(1 + ${fmtFixed(dw, 3)} − (${fmtFixed(
          dc,
          3
        )}))/10 + 640 = ${fmtFixed(720 + du, 0)} px — the same Δu for every split`;
    };

    C_D?.addEventListener("input", render);
    C_S?.addEventListener("input", render);
    render();
  }

  /* -------------------------------------------------------- checkpoint quiz */
  const quiz = document.querySelector(".quiz");
  if (quiz) {
    const opts = [...quiz.querySelectorAll(".quiz-opt")];
    const verdict = quiz.querySelector(".quiz-verdict");
    opts.forEach((opt) => {
      opt.addEventListener("click", () => {
        const right = opt.dataset.correct === "true";
        quiz.classList.add("is-locked");
        opts.forEach((o) => (o.disabled = true));
        opt.setAttribute("data-state", right ? "chosen-right" : "chosen-wrong");
        if (!right) {
          const correct = opts.find((o) => o.dataset.correct === "true");
          if (correct) correct.setAttribute("data-state", "chosen-right");
        }
        if (verdict) {
          verdict.hidden = false;
          verdict.setAttribute("data-state", right ? "right" : "wrong");
          const flag = verdict.querySelector(".verdict-flag");
          if (flag) flag.textContent = right ? "Correct" : "Not quite — see the correct option";
        }
      });
    });
  }
})();
