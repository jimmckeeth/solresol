# Reusing the Translation Library

`solresol-translator.js` is the standalone generated library for English-to-Solresol and Solresol-to-English translation. It embeds the same shared translator core used by `index.html`, so library consumers and the browser app use the same behavior.

## Importing

CommonJS:

```js
const SolresolTranslator = require('./solresol-translator.js');
```

Browser global:

```html
<script src="solresol-translator.js"></script>
<script>
  const result = SolresolTranslator.ToSolReSol('welcome');
</script>
```

AMD loaders are also supported through the generated wrapper.

## API

### `ToSolReSol(text)`

Translates English text into one result object per whitespace-separated token.

```js
const words = SolresolTranslator.ToSolReSol('Welcome to Solresol');
console.log(words[0]);
```

Result shape:

```js
{
  english: 'Welcome',
  solresol: ['Mi', 'Sol', 'Re', 'Sol'],
  unknown: false,
  matchType: 'exact',
  normalized: 'welcome',
  base: 'welcome',
  fallback: false,
  solresolKey: 'misolresol'
}
```

Fields:

- `english` — original input token.
- `solresol` — capitalized syllable names.
- `unknown` — retained for compatibility; fallback results are non-empty and use `unknown: false`.
- `matchType` — `exact`, `normalized`, or `phonetic`.
- `normalized` — normalized English token used for lookup.
- `base` — dictionary base form when normalization or morphology matched.
- `fallback` — `true` when the result is deterministic phonetic fallback rather than dictionary vocabulary.
- `solresolKey` — lowercase concatenated Solresol key.

### `FromSolReSol(text)`

Returns English aliases for each Solresol word.

```js
const aliases = SolresolTranslator.FromSolReSol('misolresol');
console.log(aliases[0]); // includes "welcome"
```

Input may be lowercase concatenated Solresol such as `misolresol`. The function returns one array of English aliases per input word.

### `splitSol(key)`

Splits a concatenated Solresol key into capitalized syllables.

```js
SolresolTranslator.splitSol('solresol'); // ['Sol', 'Re', 'Sol']
```

## Lookup Data

The library also exposes derived lookup data:

- `dictionaryEntries` — canonical Solresol-first entries with English alias arrays.
- `englishToSolresol` — normalized English alias to lowercase Solresol key.
- `solresolToEnglish` — lowercase Solresol key to English aliases.

These are useful for autocomplete, dictionary browsing, or custom search.

## Fallback Behavior

If a word cannot be found through dictionary aliases or conservative English morphology, the translator returns a deterministic phonetic fallback. Fallback output is stable for the same normalized token and is marked with:

```js
{
  matchType: 'phonetic',
  fallback: true
}
```

Use this metadata when you need to distinguish official dictionary matches from approximate generated Solresol.

## Updating the Library

Do not edit `solresol-translator.js` directly for translation behavior. Edit `solresol-core.js` or the embedded dictionary source, then regenerate:

```sh
node syncdict.js
node test.js
```

See `TESTING.md` for the full build and verification workflow.
