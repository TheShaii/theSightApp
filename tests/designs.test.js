"use strict";
// The landing page must not inherit the design last picked in a dashboard (regression).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadDesigns() {
  const ctx = {};
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "src", "js", "designs.js"), "utf8"), ctx, { filename: "designs.js" });
  return ctx.DV.designs;
}

test("landing page uses the brand design, whatever design was saved", () => {
  const designs = loadDesigns();
  for (const mode of designs.LANDING_MODES) {
    for (const prefersDark of [false, true]) {
      const id = designs.landingVariantId(mode, prefersDark);
      assert.equal(designs.variant(id).design, "thesight", `${mode}/${prefersDark} → ${id} is a TheSight variant`);
    }
  }
});

test("landing color mode: light and dark are fixed, system follows the OS", () => {
  const designs = loadDesigns();
  assert.equal(designs.landingVariantId("light", true), "thesight-light");
  assert.equal(designs.landingVariantId("dark", false), "thesight-dark");
  assert.equal(designs.landingVariantId("system", false), "thesight-light");
  assert.equal(designs.landingVariantId("system", true), "thesight-dark");
});
