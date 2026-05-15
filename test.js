#!/usr/bin/env node
// Run with: node test.js
// Tests the SOLRESOL_DICT and splitSol() logic extracted from index.html

const fs = require('fs');

// ── Extract SOLRESOL_DICT from index.html ─────────────────────────────────────
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const dictStart = html.indexOf('const SOLRESOL_DICT = ') + 'const SOLRESOL_DICT = '.length;
const dictEnd   = html.indexOf(';\n', dictStart);
const SOLRESOL_DICT = JSON.parse(html.slice(dictStart, dictEnd));

// ── splitSol() — same algorithm as index.html ─────────────────────────────────
function splitSol(key) {
  const s = []; let i = 0;
  while (i < key.length) {
    if      (key.slice(i,i+3)==='sol') { s.push('Sol'); i+=3; }
    else if (key.slice(i,i+2)==='do')  { s.push('Do');  i+=2; }
    else if (key.slice(i,i+2)==='re')  { s.push('Re');  i+=2; }
    else if (key.slice(i,i+2)==='mi')  { s.push('Mi');  i+=2; }
    else if (key.slice(i,i+2)==='fa')  { s.push('Fa');  i+=2; }
    else if (key.slice(i,i+2)==='la')  { s.push('La');  i+=2; }
    else if (key.slice(i,i+2)==='si')  { s.push('Si');  i+=2; }
    else i++;
  }
  return s;
}

// ── translate() — same algorithm as index.html ────────────────────────────────
function translate(text) {
  return text.trim().toLowerCase().split(/\s+/).map(tok => {
    let clean = tok.replace(/[^a-z']/g, '');
    let key   = SOLRESOL_DICT[clean];
    if (!key && clean.includes("'")) {
      const base = clean.split("'")[0];
      key = SOLRESOL_DICT[base];
    }
    const syls  = key ? splitSol(key) : null;
    return { english: tok, solresol: syls || [], unknown: !syls };
  });
}

// ── Test runner ───────────────────────────────────────────────────────────────
let passed = 0, failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓  ${description}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${description}`);
    console.error(`       ${e.message}`);
    failed++;
  }
}

function eq(a, b) {
  const as = JSON.stringify(a), bs = JSON.stringify(b);
  if (as !== bs) throw new Error(`Expected ${bs}, got ${as}`);
}

function notUnknown(word) {
  const result = translate(word);
  if (result[0].unknown) throw new Error(`"${word}" translated as unknown`);
}

function translatesTo(word, expectedSyls) {
  const result = translate(word);
  eq(result[0].solresol, expectedSyls);
}

// ── splitSol() unit tests ─────────────────────────────────────────────────────
console.log('\nsplitSol():');
test('splits single syllable "do"',       () => eq(splitSol('do'),         ['Do']));
test('splits single syllable "sol"',      () => eq(splitSol('sol'),        ['Sol']));
test('splits "domi" into Do Mi',          () => eq(splitSol('domi'),       ['Do','Mi']));
test('splits "solresol" into Sol Re Sol', () => eq(splitSol('solresol'),   ['Sol','Re','Sol']));
test('splits "resisolre" into Re Si Sol Re', () => eq(splitSol('resisolre'),['Re','Si','Sol','Re']));
test('splits "fado" into Fa Do',          () => eq(splitSol('fado'),       ['Fa','Do']));
test('splits "mila" into Mi La',          () => eq(splitSol('mila'),       ['Mi','La']));
test('empty string gives []',             () => eq(splitSol(''),           []));
test('unknown chars are skipped',         () => eq(splitSol('xyz'),        []));

// ── Pronoun lookup tests ──────────────────────────────────────────────────────
console.log('\nPronouns:');
test('"i" -> Do Re',     () => translatesTo('i',    ['Do','Re']));
test('"you" -> Do Mi',   () => translatesTo('you',  ['Do','Mi']));
test('"he" -> Do Fa',    () => translatesTo('he',   ['Do','Fa']));
test('"she" -> Do Fa',   () => translatesTo('she',  ['Do','Fa']));
test('"we" -> Do Re',    () => translatesTo('we',   ['Do','Re']));
test('"they" -> Do Fa',  () => translatesTo('they', ['Do','Fa']));
test('"my" -> Re Do',    () => translatesTo('my',   ['Re','Do']));
test('"your" -> Re Mi',  () => translatesTo('your', ['Re','Mi']));
test('"his" -> Re Fa',   () => translatesTo('his',  ['Re','Fa']));
test('"her" not unknown',() => notUnknown('her'));
test('"our" not unknown',() => notUnknown('our'));
test('"their" not unknown',()=>notUnknown('their'));

// ── Common function words ─────────────────────────────────────────────────────
console.log('\nFunction words:');
test('"the" -> La',      () => translatesTo('the',  ['La']));
test('"is" -> Mi La',    () => translatesTo('is',   ['Mi','La']));
test('"what" -> Fa Do',  () => translatesTo('what', ['Fa','Do']));
test('"no" -> Do',       () => translatesTo('no',   ['Do']));
test('"yes" -> Si',      () => translatesTo('yes',  ['Si']));
test('"and" -> Re',      () => translatesTo('and',  ['Re']));

// ── Key vocabulary ────────────────────────────────────────────────────────────
console.log('\nKey vocabulary:');
test('"hello" -> Si Mi',       () => translatesTo('hello',    ['Si','Mi']));
test('"love" not unknown',     () => notUnknown('love'));
test('"music" not unknown',    () => notUnknown('music'));
test('"time" not unknown',     () => notUnknown('time'));
test('"day" not unknown',      () => notUnknown('day'));
test('"word" not unknown',     () => notUnknown('word'));
test('"words" -> Si Mi La Re', () => translatesTo('words',    ['Si','Mi','La','Re']));
test('"write" not unknown',    () => notUnknown('write'));
test('"speak" not unknown',    () => notUnknown('speak'));
test('"think" not unknown',    () => notUnknown('think'));
test('"know" not unknown',     () => notUnknown('know'));
test('"happy" not unknown',    () => notUnknown('happy'));
test('"good" not unknown',     () => notUnknown('good'));
test('"bad" not unknown',      () => notUnknown('bad'));

// ── Self-referential / edge cases ─────────────────────────────────────────────
console.log('\nEdge cases:');
test('"language" -> Sol Re Sol', () => translatesTo('language', ['Sol','Re','Sol']));
test('"solresol" -> Sol Re Sol', () => translatesTo('solresol', ['Sol','Re','Sol']));
test('"Solresol" (caps) -> Sol Re Sol', () => translatesTo('Solresol', ['Sol','Re','Sol']));
test('"YOU" (caps) -> Do Mi',   () => translatesTo('YOU',    ['Do','Mi']));
test('"name" not unknown',      () => notUnknown('name'));

// ── Full phrase tests ─────────────────────────────────────────────────────────
console.log('\nFull phrases:');
test('"What is your name" has no unknowns', () => {
  const r = translate('What is your name');
  const unk = r.filter(w => w.unknown).map(w => w.english);
  if (unk.length) throw new Error(`Unknown words: ${unk.join(', ')}`);
});
test('"I love music" has no unknowns', () => {
  const r = translate('I love music');
  const unk = r.filter(w => w.unknown).map(w => w.english);
  if (unk.length) throw new Error(`Unknown words: ${unk.join(', ')}`);
});
test('"Hello world" — hello translates', () => {
  const r = translate('Hello world');
  if (r[0].unknown) throw new Error('"hello" unknown');
});
test('punctuation stripped: "hello," translates', () => notUnknown('hello,'));
test("contraction \"it's\" not unknown", () => notUnknown("it's"));

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(45)}`);
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log(`\n  Dictionary size: ${Object.keys(SOLRESOL_DICT).length} entries`);
  process.exit(1);
}
console.log(`  Dictionary size: ${Object.keys(SOLRESOL_DICT).length} entries`);
