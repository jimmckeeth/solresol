# Repository Guidelines

## Project Structure & Module Organization

This repository is a static Solresol translator and playback app. `index.html` is the self-contained browser app with embedded dictionary data and generated translator code. `solresol-core.js` is the shared source of truth for translation behavior. `solresol-translator.js` is the generated standalone JavaScript translation library for CommonJS, AMD, ES module default export, and browser global use. `syncdict.js` regenerates `index.html` and `solresol-translator.js` from shared source and checks generated-output drift. `test.js` contains Node-based regression tests for translation behavior and generated output sync. Static reference material and visual assets live in `media/`; generated audio/video samples live in `render/`.

## Build, Test, and Development Commands

- `start index.html` or open `index.html` directly: run the app locally; no server or build step is required.
- `node test.js` or `npm test`: run the full regression suite and verify generated outputs are in sync.
- `node syncdict.js` or `npm run build`: regenerate `index.html` and `solresol-translator.js` after changing `solresol-core.js`, `syncdict.js`, or embedded dictionary data.
- `node syncdict.js --check` or `npm run sync:check`: fail if generated translator outputs are stale.

## Coding Style & Naming Conventions

Use plain HTML, CSS, and vanilla JavaScript. Put reusable translation behavior in `solresol-core.js`; keep browser-only UI, playback, animation, and export behavior in `index.html`. Do not hand-edit generated translator code inside `index.html` or `solresol-translator.js`; update shared source and run `node syncdict.js`. Preserve existing JavaScript style: two-space indentation in control blocks, `const`/`let`, strict equality, short helper functions, and uppercase constants such as `SOLRESOL_DICT`. Public library APIs use PascalCase names already established by the project, such as `ToSolReSol` and `FromSolReSol`.

## Testing Guidelines

Add or update tests in `test.js` for translation changes, dictionary changes, fallback behavior, morphology/normalization, reverse aliases, and edge cases in `splitSol()`. Tests are lightweight assertions run with Node, so prefer focused cases with clear descriptions. Before submitting changes, run `node test.js` and `node syncdict.js --check`. See `TESTING.md` for the full test and build workflow.

## Translation Library Guidelines

`solresol-translator.js` is generated for reuse outside the app. Keep its public API compatible unless a change explicitly requires otherwise. Translation results should preserve `english`, `solresol`, and `unknown`, and may add metadata such as `matchType`, `normalized`, `base`, `fallback`, and `solresolKey`. Fallback translations must be distinguishable from dictionary matches. See `TRANSLATION.md` for import examples and API details.

## Commit & Pull Request Guidelines

The local Git history may not be available in all working copies, so use concise, imperative commit subjects such as `Add dictionary sync check` or `Fix Solresol punctuation handling`. Pull requests should describe the user-facing change, list test commands run, and include screenshots or short recordings for visible UI, animation, audio, or export behavior changes.

## Security & Configuration Tips

Do not commit generated secrets or local browser data. External audio dependencies are loaded by the browser, so document any CDN or sample-source changes in `README.md`. Keep generated media in `render/` small and intentional.
