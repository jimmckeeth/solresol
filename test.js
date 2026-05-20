#!/usr/bin/env node
// Run with: node test.js
// Tests the SOLRESOL_DICT and splitSol() logic extracted from index.html.
// Also verifies solresol-translator.js is in sync via sync-dict.js --check.

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── Extract SOLRESOL_DICT from index.html ─────────────────────────────────────
const html      = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
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
    if (!key && clean.includes("'")) key = SOLRESOL_DICT[clean.split("'")[0]];
    const syls = key ? splitSol(key) : null;
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

function known(word) {
  const r = translate(word);
  if (r[0].unknown) throw new Error(`"${word}" translated as unknown`);
}

function translatesTo(word, expectedSyls) {
  const r = translate(word);
  eq(r[0].solresol, expectedSyls);
}

function phraseHasNoUnknowns(phrase) {
  const r = translate(phrase);
  const unk = r.filter(w => w.unknown).map(w => w.english);
  if (unk.length) throw new Error(`Unknown words: ${unk.join(', ')}`);
}

// ── splitSol() unit tests ─────────────────────────────────────────────────────
console.log('\nsplitSol():');
test('splits "do"',              () => eq(splitSol('do'),         ['Do']));
test('splits "sol"',             () => eq(splitSol('sol'),        ['Sol']));
test('splits "domi"',            () => eq(splitSol('domi'),       ['Do','Mi']));
test('splits "solresol"',        () => eq(splitSol('solresol'),   ['Sol','Re','Sol']));
test('splits "resisolre"',       () => eq(splitSol('resisolre'),  ['Re','Si','Sol','Re']));
test('splits "fado"',            () => eq(splitSol('fado'),       ['Fa','Do']));
test('splits "mila"',            () => eq(splitSol('mila'),       ['Mi','La']));
test('splits "fa" (single)',     () => eq(splitSol('fa'),         ['Fa']));
test('splits "mido"',            () => eq(splitSol('mido'),       ['Mi','Do']));
test('splits "fami"',            () => eq(splitSol('fami'),       ['Fa','Mi']));
test('splits "fasi"',            () => eq(splitSol('fasi'),       ['Fa','Si']));
test('empty string gives []',    () => eq(splitSol(''),           []));
test('unknown chars are skipped',() => eq(splitSol('xyz'),        []));

// ── Grammar-table single-syllable words ───────────────────────────────────────
console.log('\nGrammar table — single syllable:');
test('"no"  -> Do',  () => translatesTo('no',  ['Do']));
test('"not" -> Do',  () => translatesTo('not', ['Do']));
test('"nor" -> Do',  () => translatesTo('nor', ['Do']));
test('"and" -> Re',  () => translatesTo('and', ['Re']));
test('"or"  -> Mi',  () => translatesTo('or',  ['Mi']));
test('"to"  -> Fa',  () => translatesTo('to',  ['Fa']));
test('"if"  -> Sol', () => translatesTo('if',  ['Sol']));
test('"the" -> La',  () => translatesTo('the', ['La']));
test('"a"   -> La',  () => translatesTo('a',   ['La']));
test('"an"  -> La',  () => translatesTo('an',  ['La']));
test('"yes" -> Si',  () => translatesTo('yes', ['Si']));

// ── Grammar-table two-syllable function words ─────────────────────────────────
console.log('\nGrammar table — two syllable:');
test('"i"    -> Do Re', () => translatesTo('i',    ['Do','Re']));
test('"me"   -> Do Re', () => translatesTo('me',   ['Do','Re']));
test('"we"   -> Do Re', () => translatesTo('we',   ['Do','Re']));
test('"you"  -> Do Mi', () => translatesTo('you',  ['Do','Mi']));
test('"he"   -> Do Fa', () => translatesTo('he',   ['Do','Fa']));
test('"she"  -> Do Fa', () => translatesTo('she',  ['Do','Fa']));
test('"they" -> Do Fa', () => translatesTo('they', ['Do','Fa']));
test('"it"   -> Do Fa', () => translatesTo('it',   ['Do','Fa']));
test('"my"   -> Re Do', () => translatesTo('my',   ['Re','Do']));
test('"your" -> Re Mi', () => translatesTo('your', ['Re','Mi']));
test('"his"  -> Re Fa', () => translatesTo('his',  ['Re','Fa']));
test('"for"  -> Mi Do', () => translatesTo('for',  ['Mi','Do']));
test('"what" -> Fa Do', () => translatesTo('what', ['Fa','Do']));
test('"this" -> Fa Mi', () => translatesTo('this', ['Fa','Mi']));
test('"that" -> Fa Mi', () => translatesTo('that', ['Fa','Mi']));
test('"much" -> Fa Si', () => translatesTo('much', ['Fa','Si']));
test('"very" -> Fa Si', () => translatesTo('very', ['Fa','Si']));

// ── Pronouns & possessives ────────────────────────────────────────────────────
console.log('\nPronouns & possessives:');
test('"her"   not unknown', () => known('her'));
test('"our"   not unknown', () => known('our'));
test('"their" not unknown', () => known('their'));
test('"its"   not unknown', () => known('its'));

// ── Common verbs ──────────────────────────────────────────────────────────────
console.log('\nCommon verbs:');
test('"be"     not unknown', () => known('be'));
test('"is"     -> Mi La',   () => translatesTo('is',  ['Mi','La']));
test('"are"    not unknown', () => known('are'));
test('"have"   not unknown', () => known('have'));
test('"do"     not unknown', () => known('do'));
test('"make"   not unknown', () => known('make'));
test('"makes"  not unknown', () => known('makes'));
test('"made"   not unknown', () => known('made'));
test('"say"    not unknown', () => known('say'));
test('"says"   not unknown', () => known('says'));
test('"said"   not unknown', () => known('said'));
test('"go"     not unknown', () => known('go'));
test('"goes"   not unknown', () => known('goes'));
test('"come"   not unknown', () => known('come'));
test('"comes"  not unknown', () => known('comes'));
test('"get"    not unknown', () => known('get'));
test('"gets"   not unknown', () => known('gets'));
test('"got"    not unknown', () => known('got'));
test('"see"    not unknown', () => known('see'));
test('"know"   not unknown', () => known('know'));
test('"love"   not unknown', () => known('love'));
test('"think"  not unknown', () => known('think'));
test('"speak"  not unknown', () => known('speak'));
test('"write"  not unknown', () => known('write'));
test('"use"    not unknown', () => known('use'));

// ── Common nouns ──────────────────────────────────────────────────────────────
console.log('\nCommon nouns:');
test('"time"      not unknown', () => known('time'));
test('"day"       not unknown', () => known('day'));
test('"year"      not unknown', () => known('year'));
test('"word"      not unknown', () => known('word'));
test('"words" -> Si Mi La Re', () => translatesTo('words', ['Si','Mi','La','Re']));
test('"language" -> Sol Re Sol', () => translatesTo('language', ['Sol','Re','Sol']));
test('"languages"  not unknown', () => known('languages'));
test('"music"     not unknown', () => known('music'));
test('"color"     not unknown', () => known('color'));
test('"colors"    not unknown', () => known('colors'));
test('"name"      not unknown', () => known('name'));
test('"man"       not unknown', () => known('man'));
test('"world"     not unknown', () => known('world'));

// ── Common adjectives / adverbs ───────────────────────────────────────────────
console.log('\nAdjectives & adverbs:');
test('"good"  not unknown', () => known('good'));
test('"bad"   not unknown', () => known('bad'));
test('"happy" not unknown', () => known('happy'));
test('"much"  -> Fa Si',    () => translatesTo('much', ['Fa','Si']));
test('"very"  -> Fa Si',    () => translatesTo('very', ['Fa','Si']));

// ── Prepositions ──────────────────────────────────────────────────────────────
console.log('\nPrepositions:');
test('"to"  -> Fa',    () => translatesTo('to',   ['Fa']));
test('"for" -> Mi Do', () => translatesTo('for',  ['Mi','Do']));
test('"of"  not unknown', () => known('of'));
test('"by"  not unknown', () => known('by'));
test('"with" not unknown', () => known('with'));
test('"in"   not unknown', () => known('in'));

// ── Self-referential & edge cases ─────────────────────────────────────────────
console.log('\nEdge cases:');
test('"hello" -> Si Mi',            () => translatesTo('hello',    ['Si','Mi']));
test('"language" -> Sol Re Sol',    () => translatesTo('language', ['Sol','Re','Sol']));
test('"solresol" -> Sol Re Sol',    () => translatesTo('solresol', ['Sol','Re','Sol']));
test('"Solresol" (caps) -> Sol Re Sol', () => translatesTo('Solresol', ['Sol','Re','Sol']));
test('"YOU" (caps) -> Do Mi',       () => translatesTo('YOU',    ['Do','Mi']));
test('punctuation stripped: "hello,"', () => known('hello,'));
test("contraction \"it's\"",        () => known("it's"));
test("contraction \"don't\"",       () => known("don't"));
test("contraction \"I'm\"",         () => known("I'm"));

// ── Full-phrase smoke tests ───────────────────────────────────────────────────
console.log('\nFull phrases (no unknowns):');
test('"What is your name"',           () => phraseHasNoUnknowns('What is your name'));
test('"I love music"',                () => phraseHasNoUnknowns('I love music'));
test('"for languages to make"',       () => phraseHasNoUnknowns('for languages to make'));
test('"Solresol is the language of music"', () => phraseHasNoUnknowns('Solresol is the language of music'));
test('"Hello world"',                 () => phraseHasNoUnknowns('Hello world'));
test('"yes and no"',                  () => phraseHasNoUnknowns('yes and no'));
test('"the good and the bad"',        () => phraseHasNoUnknowns('the good and the bad'));
test('"I think therefore I am"',      () => phraseHasNoUnknowns('I think therefore I am'));
test('"do you speak solresol"',       () => phraseHasNoUnknowns('do you speak solresol'));
test('"to make music with colors"',   () => phraseHasNoUnknowns('to make music with colors'));

// ── Encoding tables ───────────────────────────────────────────────────────────
console.log('\nEncoding tables:');
const SAUSO  = { Do:'𐑴', Re:'𐑦', Mi:'𐑵', Fa:'𐑳', Sol:'𐑯', La:'𐑤', Si:'𐑨' };
const NUM    = { Do:1, Re:2, Mi:3, Fa:4, Sol:5, La:6, Si:7 };
const BINARY = { Do:'001', Re:'010', Mi:'011', Fa:'100', Sol:'101', La:'110', Si:'111' };
const syls   = ['Do','Re','Mi','Fa','Sol','La','Si'];
test('SAUSO has all 7 syllables',  () => syls.forEach(s=>{ if(!SAUSO[s])  throw new Error(`Missing SAUSO[${s}]`); }));
test('NUM has all 7 syllables',    () => syls.forEach(s=>{ if(!NUM[s])    throw new Error(`Missing NUM[${s}]`); }));
test('BINARY has all 7 syllables', () => syls.forEach(s=>{ if(!BINARY[s]) throw new Error(`Missing BINARY[${s}]`); }));
test('NUM values are 1-7',         () => syls.forEach((s,i)=>{ if(NUM[s]!==i+1) throw new Error(`NUM[${s}]=${NUM[s]}, want ${i+1}`); }));
test('Do: dec=1 hex=1 oct=1 bin=001', () => { const n=NUM.Do;  eq([n,n.toString(16),n.toString(8),BINARY.Do],  [1,'1','1','001']); });
test('Sol: dec=5 hex=5 oct=5 bin=101',() => { const n=NUM.Sol; eq([n,n.toString(16),n.toString(8),BINARY.Sol], [5,'5','5','101']); });

// ── Sync check: solresol-translator.js must match index.html dict ─────────────
console.log('\nSync check:');
test('solresol-translator.js matches index.html dictionary', () => {
  try {
    execSync('node ' + path.join(__dirname, 'sync-dict.js') + ' --check', { stdio: 'pipe' });
  } catch(e) {
    throw new Error('Run "node sync-dict.js" to sync the standalone library.');
  }
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(45)}`);
console.log(`  ${passed} passed, ${failed} failed`);
console.log(`  Dictionary size: ${Object.keys(SOLRESOL_DICT).length} entries`);
if (failed > 0) process.exit(1);
