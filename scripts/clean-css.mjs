/* eslint-disable no-console */
/**
 * One-shot CSS utility-class cleanup.
 *
 * Scans `src/` + `index.html` for `u-foo` class names actually used, then walks
 * styles.css and drops any top-level OR @media-nested rule whose selectors are
 * entirely composed of unused `.u-*` classes. Leaves all non-utility rules and
 * any rule that still references a used class untouched.
 *
 * Run once: `node scripts/clean-css.mjs`
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CSS_PATH = path.join(ROOT, "styles.css");

function listFiles(dir, exts) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p, exts));
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(p);
  }
  return out;
}

function collectUsed() {
  const used = new Set();
  const re = /\bu-[a-z][a-z0-9-]*/g;
  const sources = [
    ...listFiles(path.join(ROOT, "src"), [".ts", ".tsx", ".js", ".jsx", ".html"]),
    path.join(ROOT, "index.html"),
  ];
  for (const file of sources) {
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(re)) used.add(m[0]);
  }
  return used;
}

/** Split CSS into top-level chunks: each chunk is either a rule (selector { ... })
 *  or an at-rule (@media (...) { ... possibly with nested rules ... }), or a
 *  comment, or whitespace. Balanced-brace aware. */
function tokenize(css) {
  const chunks = [];
  let i = 0;
  const n = css.length;
  while (i < n) {
    // Whitespace
    if (/\s/.test(css[i])) {
      const start = i;
      while (i < n && /\s/.test(css[i])) i++;
      chunks.push({ kind: "ws", text: css.slice(start, i) });
      continue;
    }
    // Comment
    if (css[i] === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      chunks.push({ kind: "comment", text: css.slice(i, stop) });
      i = stop;
      continue;
    }
    // Rule (selector or @-rule): read until matching '{', then balanced braces.
    const headerStart = i;
    while (i < n && css[i] !== "{" && css[i] !== ";") i++;
    if (i >= n) {
      chunks.push({ kind: "trailing", text: css.slice(headerStart) });
      break;
    }
    if (css[i] === ";") {
      // At-rule without block, e.g. @import ...;
      chunks.push({ kind: "atrule-statement", text: css.slice(headerStart, i + 1) });
      i++;
      continue;
    }
    // Balanced braces
    let depth = 1;
    let j = i + 1;
    while (j < n && depth > 0) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      if (depth === 0) break;
      j++;
    }
    const header = css.slice(headerStart, i).trim();
    const body = css.slice(i + 1, j);
    chunks.push({
      kind: header.startsWith("@") ? "atrule-block" : "rule",
      header,
      body,
      text: css.slice(headerStart, j + 1),
    });
    i = j + 1;
  }
  return chunks;
}

/** A selector list is dead iff every comma-split selector consists ONLY of
 *  `.u-*` class tokens AND none of those classes are used. We only filter on
 *  "pure utility" rules — anything mixing tags / descendants / pseudos with a
 *  utility class stays untouched. */
function isDeadUtilityRule(selectorList, used) {
  const sels = selectorList.split(",").map((s) => s.trim()).filter(Boolean);
  if (sels.length === 0) return false;
  for (const sel of sels) {
    // Must be a single class selector beginning with .u-
    if (!/^\.u-[a-z0-9-]+$/.test(sel)) return false;
  }
  // All are .u-foo class selectors — keep if any one is used.
  for (const sel of sels) {
    const cls = sel.slice(1);
    if (used.has(cls)) return false;
  }
  return true;
}

function filterAtRuleBody(body, used) {
  // Recursively tokenize and strip dead rules from inside an @media/@supports body.
  const sub = tokenize(body);
  let out = "";
  for (const c of sub) {
    if (c.kind === "rule" && isDeadUtilityRule(c.header, used)) continue;
    if (c.kind === "atrule-block") {
      out += c.text.replace(c.body, filterAtRuleBody(c.body, used));
      continue;
    }
    out += c.text;
  }
  return out;
}

function main() {
  const css = fs.readFileSync(CSS_PATH, "utf8");
  const used = collectUsed();
  console.log(`Found ${used.size} used u-* utilities`);

  const chunks = tokenize(css);
  let removed = 0;
  let kept = "";
  for (const c of chunks) {
    if (c.kind === "rule" && isDeadUtilityRule(c.header, used)) {
      removed++;
      continue;
    }
    if (c.kind === "atrule-block") {
      const filtered = filterAtRuleBody(c.body, used);
      // If body becomes empty (only whitespace), drop the whole @media wrapper.
      if (filtered.trim() === "") {
        removed++;
        continue;
      }
      kept += c.text.replace(c.body, filtered);
      continue;
    }
    kept += c.text;
  }

  // Collapse runs of >2 blank lines created by deletions.
  kept = kept.replace(/\n{3,}/g, "\n\n");

  fs.writeFileSync(CSS_PATH, kept, "utf8");
  console.log(`Removed ${removed} dead utility rule(s).`);
  console.log(
    `styles.css: ${css.length} → ${kept.length} bytes (${((1 - kept.length / css.length) * 100).toFixed(1)}% smaller)`,
  );
}

main();
