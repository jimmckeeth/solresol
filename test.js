#!/usr/bin/env node
// Run with: node test.js
// Regression tests for the shared Solresol translator and generated outputs.

const translator = require('./solresol-translator.js');
const { sync } = require('./syncdict.js');

const {
  ToSolReSol,
  FromSolReSol,
  splitSol,
  dictionaryEntries,
  englishToSolresol,
  solresolToEnglish,
} = translator;

let passed = 0;
let failed = 0;

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
  const as = JSON.stringify(a);
  const bs = JSON.stringify(b);
  if (as !== bs) throw new Error(`Expected ${bs}, got ${as}`);
}

function result(word) {
  const r = ToSolReSol(word);
  if (r.length !== 1) throw new Error(`Expected one result for "${word}", got ${r.length}`);
  return r[0];
}

function known(word) {
  const r = result(word);
  if (r.fallback) throw new Error(`"${word}" translated by fallback`);
  if (r.unknown) throw new Error(`"${word}" translated as unknown`);
  return r;
}

function translatesTo(word, expectedSyls) {
  eq(known(word).solresol, expectedSyls);
}

function phraseHasNoUnknowns(phrase) {
  const r = ToSolReSol(phrase);
  const unk = r.filter(w => w.unknown || !w.solresol.length).map(w => w.english);
  if (unk.length) throw new Error(`Unknown words: ${unk.join(', ')}`);
}

console.log('\nsplitSol():');
test('splits "do"', () => eq(splitSol('do'), ['Do']));
test('splits "sol"', () => eq(splitSol('sol'), ['Sol']));
test('splits "domi"', () => eq(splitSol('domi'), ['Do', 'Mi']));
test('splits "solresol"', () => eq(splitSol('solresol'), ['Sol', 'Re', 'Sol']));
test('splits "resisolre"', () => eq(splitSol('resisolre'), ['Re', 'Si', 'Sol', 'Re']));
test('empty string gives []', () => eq(splitSol(''), []));
test('unknown chars are skipped', () => eq(splitSol('xyz'), []));

console.log('\nDictionary aliases:');
test('"welcome" resolves to Misolresol', () => translatesTo('welcome', ['Mi', 'Sol', 'Re', 'Sol']));
test('reverse lookup returns multiple aliases', () => {
  const aliases = FromSolReSol('misolresol')[0];
  if (!aliases.includes('welcome')) throw new Error('Missing welcome alias');
  if (!aliases.includes('admit')) throw new Error('Missing existing dictionary alias');
});
test('canonical indexes are exposed', () => {
  if (!Array.isArray(dictionaryEntries) || dictionaryEntries.length < 2500) throw new Error('Missing canonical entries');
  if (englishToSolresol.welcome !== 'misolresol') throw new Error('Missing English index alias');
  if (!solresolToEnglish.misolresol.includes('welcome')) throw new Error('Missing reverse index alias');
});

console.log('\nGrammar table — single syllable:');
test('"no"  -> Do', () => translatesTo('no', ['Do']));
test('"not" -> Do', () => translatesTo('not', ['Do']));
test('"and" -> Re', () => translatesTo('and', ['Re']));
test('"or"  -> Mi', () => translatesTo('or', ['Mi']));
test('"to"  -> Fa', () => translatesTo('to', ['Fa']));
test('"if"  -> Sol', () => translatesTo('if', ['Sol']));
test('"the" -> La', () => translatesTo('the', ['La']));
test('"yes" -> Si', () => translatesTo('yes', ['Si']));

console.log('\nCommon words:');
test('"i"    -> Do Re', () => translatesTo('i', ['Do', 'Re']));
test('"you"  -> Do Mi', () => translatesTo('you', ['Do', 'Mi']));
test('"what" -> Fa Do', () => translatesTo('what', ['Fa', 'Do']));
test('"is"   -> Mi La', () => translatesTo('is', ['Mi', 'La']));
test('"hello" -> Si Mi', () => translatesTo('hello', ['Si', 'Mi']));
test('"language" -> Sol Re Sol', () => translatesTo('language', ['Sol', 'Re', 'Sol']));
test('"Solresol" caps -> Sol Re Sol', () => translatesTo('Solresol', ['Sol', 'Re', 'Sol']));

console.log('\nNormalization and morphology:');
test('punctuation stripped: "hello,"', () => known('hello,'));
test("possessive contraction \"name's\" records base", () => {
  const r = known("name's");
  if (r.base !== 'name') throw new Error(`Expected base "name", got "${r.base}"`);
});
test("negative contraction \"don't\" stays known", () => known("don't"));
test('unlisted plural resolves through base form', () => {
  const r = known('welcomes');
  eq(r.solresol, ['Mi', 'Sol', 'Re', 'Sol']);
});
test('unlisted gerund resolves through base form', () => {
  const r = known('translating');
  eq(r.solresol, ['Sol', 'Do', 'Sol']);
  if (r.matchType !== 'normalized') throw new Error(`Expected normalized match, got ${r.matchType}`);
  if (r.base !== 'translate') throw new Error(`Expected base translate, got ${r.base}`);
});
test('exact match wins over generated form', () => {
  const r = known('words');
  eq(r.solresol, ['Si', 'Mi', 'La', 'Re']);
  if (r.matchType !== 'exact') throw new Error(`Expected exact match, got ${r.matchType}`);
  if (r.base !== 'words') throw new Error(`Expected base words, got ${r.base}`);
});

console.log('\nFallback:');
test('unknown word receives stable phonetic fallback', () => {
  const a = result('foobarqux');
  const b = result('foobarqux');
  if (!a.fallback) throw new Error('Expected fallback result');
  if (a.unknown) throw new Error('Fallback should not be empty/unknown');
  if (!a.solresol.length) throw new Error('Fallback syllables are empty');
  eq(a.solresol, b.solresol);
  if (a.matchType !== 'phonetic') throw new Error(`Expected phonetic matchType, got ${a.matchType}`);
});
test('fallback keeps original token text', () => {
  const r = result('FoobarQux!');
  if (r.english !== 'FoobarQux!') throw new Error(`Original token changed to ${r.english}`);
  if (r.normalized !== 'foobarqux') throw new Error(`Unexpected normalized token ${r.normalized}`);
});

console.log('\nFull phrases (no unknowns):');
test('"What is your name"', () => phraseHasNoUnknowns('What is your name'));
test('"Welcome to Solresol"', () => phraseHasNoUnknowns('Welcome to Solresol'));
test('"I think therefore I am"', () => phraseHasNoUnknowns('I think therefore I am'));
test('"Words are translating"', () => phraseHasNoUnknowns('Words are translating'));

console.log('\nGenerated output checks:');
test('generated files match shared source and dictionary', () => {
  const result = sync({ checkOnly: true });
  if (!result.ok) throw new Error(result.message);
});
test('npm test script is declared', () => {
  const pkg = require('./package.json');
  if (pkg.scripts.test !== 'node test.js') throw new Error('Missing npm test script');
  if (pkg.scripts['sync:check'] !== 'node syncdict.js --check') throw new Error('Missing sync:check script');
});

console.log(`\n${'─'.repeat(45)}`);
console.log(`  ${passed} passed, ${failed} failed`);
console.log(`  Dictionary entries: ${dictionaryEntries.length}`);
if (failed > 0) process.exit(1);
