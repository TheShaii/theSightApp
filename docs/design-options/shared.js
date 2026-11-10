"use strict";
// Mockup-only helpers shared by option-a.html and option-b.html.
// Data is the reference workbook (samples/sample_multiple_pivot_tables_dashboard.xlsx),
// so both options show the same real numbers and differ only in design.
(function () {
  const DATA = {
    title: "Marketing budget & spend",
    subtitle: "Invented demo data for illustration only. All amounts in USD.",
    file: "sample_multiple_pivot_tables_dashboard.xlsx",
    fiscalYear: 2026,
    totals: { budget: 4820500, committed: 1580664.1, invoiced: 3223046.04, actual: 5964312.48, paid: 2175640.19, variance: 1143812.48 },
    campaigns: [
      ["Spring Launch", 768368, 250087.76, 545646.02, 1136762.55, 353194.33],
      ["Summer Sale", 663223, 222902.87, 429294.41, 825566.18, 290705.68],
      ["Back to School", 614695, 270941.74, 474148.04, 846692.93, 333220.9],
      ["Holiday Push", 493373, 122928.77, 335260.27, 558767.12, 243054.04],
      ["Brand Refresh", 436757, 110693.97, 262385.7, 409977.65, 127380.85],
      ["Loyalty Program", 388228, 162247.98, 243371.97, 507024.93, 98765.43],
      ["Product Webinars", 315436, 74345.68, 175726.15, 337934.9, 212768.91],
      ["Trade Shows", 266907, 97057.73, 201304.93, 359473.09, 156364.58],
      ["Influencer Series", 218378, 60605.25, 113634.85, 189391.42, 58844.28],
      ["Search Ads", 194114, 52286.94, 152107.48, 237667.93, 83689.74],
      ["Social Video", 169850, 51470.04, 91502.29, 190629.77, 75023.45],
      ["Email Nurture", 129409, 67603.15, 109855.12, 211259.84, 91894.38],
      ["Customer Stories", 97057, 16993.26, 43255.56, 77242.08, 23999.26],
      ["Local Sponsorships", 64705, 20498.96, 45553.25, 75922.09, 26734.36],
    ].map(([name, budget, committed, invoiced, actual, paid]) => ({ name, budget, committed, invoiced, actual, paid, variance: actual - budget })),
    departments: [
      ["Brand", 1502493, 2068120.12, 829459.94],
      ["Digital", 1189474, 1461841.32, 502542.85],
      ["Events", 876455, 990975.07, 317959.91],
      ["Partnerships", 563435, 526262.83, 241220.55],
      ["Content", 438227, 646287.35, 185147.25],
      ["Research", 250416, 270825.79, 99309.69],
    ].map(([name, budget, actual, paid]) => ({ name, budget, actual, paid, variance: actual - budget })),
    phases: [
      ["Phase 1", 1831790, 1767491.84],
      ["Phase 2", 1590765, 1336396.27],
      ["Phase 3", 1397945, 1207067.59],
    ].map(([name, budget, actual]) => ({ name, budget, actual })),
    agencies: [
      ["Brightline Media", 1848936.87], ["Copperleaf Creative", 1133219.37], ["Northstar Digital", 775360.62],
      ["Bluewave Events", 536788.12], ["Harborview PR", 417501.87], ["Summit Print Co.", 357858.75],
      ["Lumen Analytics", 298215.63], ["Oakridge Studios", 238572.5], ["Pixel & Pine", 208750.94],
      ["Riverside Promotions", 149107.81],
    ].map(([name, actual]) => ({ name, actual })),
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function compact(n) {
    const a = Math.abs(n), sign = n < 0 ? "−" : "";
    if (a >= 1e6) return sign + (a / 1e6).toFixed(2) + "M";
    if (a >= 1e3) return sign + Math.round(a / 1e3) + "K";
    return sign + Math.round(a);
  }
  const full = (n) => (n < 0 ? "−" : "") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const signed = (n) => (n > 0 ? "+" : "") + compact(n);
  const pct = (n) => Math.round(n * 100) + "%";

  // Budget vs actual per member: plan as a track, actual as the bar, marker at plan.
  function bulletRows(rows, { limit = rows.length } = {}) {
    const shown = rows.slice(0, limit);
    const max = Math.max(...shown.map((r) => Math.max(r.budget, r.actual)));
    return `<div class="viz viz--bullet" role="list">${shown.map((r) => {
      const over = r.actual > r.budget;
      const tip = `${r.name}: Actual ${full(r.actual)} · Budget ${full(r.budget)} · ${over ? "over" : "under"} by ${full(Math.abs(r.actual - r.budget))}`;
      return `<div class="row" role="listitem" data-member="${esc(r.name)}" data-tip="${esc(tip)}" tabindex="0">
        <span class="row__label">${esc(r.name)}</span>
        <span class="row__track">
          <span class="bar bar--plan" style="width:${(r.budget / max) * 100}%"></span>
          <span class="bar bar--actual ${over ? "is-over" : "is-under"}" style="width:${(r.actual / max) * 100}%"></span>
          <span class="bar__marker" style="left:${(r.budget / max) * 100}%"></span>
        </span>
        <span class="row__value">${compact(r.actual)}</span>
        <span class="row__delta ${over ? "is-over" : "is-under"}">${signed(r.actual - r.budget)}</span>
      </div>`;
    }).join("")}</div>`;
  }

  // Diverging bars from a zero line: over budget right, under budget left.
  function divergingRows(rows) {
    const max = Math.max(...rows.map((r) => Math.abs(r.variance)));
    return `<div class="viz viz--diverging" role="list">${rows.map((r) => {
      const w = (Math.abs(r.variance) / max) * 50;
      const over = r.variance > 0;
      const tip = `${r.name}: ${over ? "over" : "under"} budget by ${full(Math.abs(r.variance))}`;
      return `<div class="row" role="listitem" data-member="${esc(r.name)}" data-tip="${esc(tip)}" tabindex="0">
        <span class="row__label">${esc(r.name)}</span>
        <span class="row__track row__track--zero">
          <span class="bar ${over ? "is-over" : "is-under"}" style="${over ? "left:50%" : `left:${50 - w}%`};width:${w}%"></span>
        </span>
        <span class="row__delta ${over ? "is-over" : "is-under"}">${signed(r.variance)}</span>
      </div>`;
    }).join("")}</div>`;
  }

  // Ranked bars with share of Grand Total and the running share (Pareto read without dual axes).
  function rankedRows(rows, total) {
    const max = rows[0].actual;
    let run = 0;
    return `<div class="viz viz--ranked" role="list">${rows.map((r, i) => {
      run += r.actual;
      const tip = `${r.name}: ${full(r.actual)} · ${pct(r.actual / total)} of Grand Total · top ${i + 1} = ${pct(run / total)}`;
      return `<div class="row" role="listitem" data-member="${esc(r.name)}" data-tip="${esc(tip)}" tabindex="0">
        <span class="row__label">${esc(r.name)}</span>
        <span class="row__track"><span class="bar ${i === 0 ? "is-lead" : ""}" style="width:${(r.actual / max) * 100}%"></span></span>
        <span class="row__value">${compact(r.actual)}</span>
        <span class="row__share">${pct(run / total)}</span>
      </div>`;
    }).join("")}</div>`;
  }

  // Vertical paired columns for a short ordered dimension (3 phases).
  function pairedColumns(rows) {
    const max = Math.max(...rows.flatMap((r) => [r.budget, r.actual]));
    return `<div class="viz viz--columns">${rows.map((r) => `
      <div class="col" data-member="${esc(r.name)}" data-tip="${esc(`${r.name}: Budget ${full(r.budget)} · Actual ${full(r.actual)}`)}" tabindex="0">
        <div class="col__bars">
          <span class="col__bar col__bar--plan" style="height:${(r.budget / max) * 100}%"><em>${compact(r.budget)}</em></span>
          <span class="col__bar col__bar--actual" style="height:${(r.actual / max) * 100}%"><em>${compact(r.actual)}</em></span>
        </div>
        <span class="col__label">${esc(r.name)}</span>
      </div>`).join("")}</div>`;
  }

  function campaignTable(rows, totals) {
    const cols = [["budget", "Budget"], ["committed", "Committed"], ["invoiced", "Invoiced"], ["actual", "Actual cost"], ["paid", "Paid"], ["variance", "Budget vs actual"]];
    const cell = (k, v) => `<td class="num ${k === "variance" ? (v > 0 ? "is-over" : "is-under") : ""}">${full(v)}</td>`;
    return `<div class="table-wrap" tabindex="0" role="region" aria-label="Budget and spend by campaign, data table">
      <table class="data">
        <thead><tr><th scope="col">Campaign</th>${cols.map(([, l]) => `<th scope="col" class="num">${l}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((r) => `<tr data-member="${esc(r.name)}"><th scope="row">${esc(r.name)}</th>${cols.map(([k]) => cell(k, r[k])).join("")}</tr>`).join("")}</tbody>
        <tfoot><tr><th scope="row">Grand Total</th>${cols.map(([k]) => cell(k, totals[k])).join("")}</tr></tfoot>
      </table></div>`;
  }

  // One tooltip for every [data-tip], plus click-to-highlight a member everywhere it appears.
  function wireInteractions(root) {
    const tip = document.createElement("div");
    tip.className = "tip";
    tip.setAttribute("role", "status");
    document.body.appendChild(tip);
    const show = (el, x, y) => {
      tip.textContent = el.dataset.tip;
      tip.classList.add("is-on");
      const r = tip.getBoundingClientRect();
      tip.style.left = Math.min(window.innerWidth - r.width - 8, Math.max(8, x - r.width / 2)) + "px";
      tip.style.top = Math.max(8, y - r.height - 12) + "px";
    };
    root.addEventListener("pointermove", (e) => {
      const el = e.target.closest("[data-tip]");
      if (el) show(el, e.clientX, e.clientY); else tip.classList.remove("is-on");
    });
    root.addEventListener("pointerleave", () => tip.classList.remove("is-on"));
    root.addEventListener("focusin", (e) => {
      const el = e.target.closest("[data-tip]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      show(el, r.left + r.width / 2, r.top);
    });
    root.addEventListener("focusout", () => tip.classList.remove("is-on"));

    const highlight = (name) => {
      const same = root.dataset.hl === name;
      root.querySelectorAll(".is-hl").forEach((n) => n.classList.remove("is-hl"));
      if (same) { delete root.dataset.hl; return; }
      root.dataset.hl = name;
      root.querySelectorAll("[data-member]").forEach((n) => { if (n.dataset.member === name) n.classList.add("is-hl"); });
    };
    root.addEventListener("click", (e) => {
      const el = e.target.closest("[data-member]");
      if (el) highlight(el.dataset.member);
    });
    root.addEventListener("keydown", (e) => {
      const el = e.target.closest("[data-member]");
      if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); highlight(el.dataset.member); }
    });
  }

  // Theme comes from ?theme= (set by compare.html) or the page's own toggle.
  function initTheme(defaultTheme) {
    const fromUrl = new URLSearchParams(location.search).get("theme");
    const set = (t) => {
      document.documentElement.dataset.theme = t;
      document.querySelectorAll("[data-theme-toggle]").forEach((b) => b.setAttribute("aria-pressed", String(t === "dark")));
    };
    set(fromUrl === "light" || fromUrl === "dark" ? fromUrl : defaultTheme);
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => {
      set(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    }));
  }

  window.Mock = { DATA, esc, compact, full, signed, pct, bulletRows, divergingRows, rankedRows, pairedColumns, campaignTable, wireInteractions, initTheme };
})();
