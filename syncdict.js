#!/usr/bin/env node
/**
 * sync-dict.js
 * Keeps the Solresol dictionary in sync between index.html (source of truth)
 * and solresol-translator.js (standalone library).
 *
 * Usage:
 *   node sync-dict.js          # update solresol-translator.js from index.html
 *   node sync-dict.js --check  # exit 1 if they are out of sync (for CI/hooks)
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const root = __dirname;

// ── Extract dict from index.html ─────────────────────────────────────────────
const html    = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const MARKER  = 'const SOLRESOL_DICT = ';
const dictStart = html.indexOf(MARKER) + MARKER.length;
const dictEnd   = html.indexOf(';\n', dictStart);
if (dictStart < MARKER.length || dictEnd < 0) {
  console.error('sync-dict: could not locate SOLRESOL_DICT in index.html');
  process.exit(1);
}
const dictJson = html.slice(dictStart, dictEnd);

// Quick parse sanity check
try { JSON.parse(dictJson); } catch(e) {
  console.error('sync-dict: SOLRESOL_DICT in index.html is not valid JSON:', e.message);
  process.exit(1);
}

// ── Patch solresol-translator.js ──────────────────────────────────────────────
const libPath = path.join(root, 'solresol-translator.js');
const lib     = fs.readFileSync(libPath, 'utf8');
const LIB_START = 'const DICT = ';
const LIB_END   = ';\n';
const ls = lib.indexOf(LIB_START) + LIB_START.length;
const le = lib.indexOf(LIB_END, ls);
if (ls < LIB_START.length || le < 0) {
  console.error('sync-dict: could not locate DICT in solresol-translator.js');
  process.exit(1);
}
const libDictJson = lib.slice(ls, le);

if (libDictJson === dictJson) {
  console.log('sync-dict: already in sync (' + Object.keys(JSON.parse(dictJson)).length + ' entries).');
  process.exit(0);
}

if (process.argv.includes('--check')) {
  console.error('sync-dict: OUT OF SYNC — run "node sync-dict.js" to update solresol-translator.js');
  process.exit(1);
}

const newLib = lib.slice(0, ls) + dictJson + lib.slice(le);
fs.writeFileSync(libPath, newLib);
const count = Object.keys(JSON.parse(dictJson)).length;
console.log('sync-dict: updated solresol-translator.js (' + count + ' entries).');
