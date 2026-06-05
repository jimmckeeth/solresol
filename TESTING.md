# Testing and Build Process

This project is a static browser app with generated translator outputs. The source files that matter for translation are:

- `solresol-core.js` — shared translator implementation.
- `index.html` — self-contained browser app with embedded dictionary and generated translator core.
- `solresol-translator.js` — standalone generated translator library.
- `syncdict.js` — generator and drift checker.
- `test.js` — Node regression tests.

## Quick Checks

Run the full regression suite:

```sh
node test.js
```

Or through npm:

```sh
npm test
```

The test suite checks:

- Solresol syllable splitting.
- English aliases such as `welcome`.
- reverse Solresol-to-English aliases.
- punctuation, contractions, and morphology normalization.
- exact-match precedence over generated word forms.
- deterministic phonetic fallback for unresolved English words.
- generated-output drift via `syncdict.js`.

## Build and Sync

Regenerate the generated files after changing `solresol-core.js`, `syncdict.js`, or the dictionary embedded in `index.html`:

```sh
node syncdict.js
```

Equivalent npm command:

```sh
npm run build
```

This updates:

- `index.html`
- `solresol-translator.js`

## Drift Check

Check whether generated files are current without rewriting them:

```sh
node syncdict.js --check
```

Equivalent npm command:

```sh
npm run sync:check
```

The command exits non-zero if `index.html` or `solresol-translator.js` is stale and prints the command to refresh them.

## Recommended Workflow

1. Edit shared translation behavior in `solresol-core.js`.
2. Run `node syncdict.js`.
3. Run `node test.js`.
4. Run `node syncdict.js --check` before committing.

For UI-only changes in `index.html`, run `node test.js` to ensure the generated translator block is still in sync and translation regressions are covered.
