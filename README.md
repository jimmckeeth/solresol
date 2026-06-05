# Solresol Experience

| Created by [François Sudre](https://en.wikipedia.org/wiki/Fran%C3%A7ois_Sudre) in 1827 | [IETF](https://en.wikipedia.org/wiki/IETF_language_tag): `art-x-solresol` | [ISO 639-3](https://en.wikipedia.org/wiki/ISO_639-3): [`qso`](https://iso639-3.sil.org/code/qso) |

A single-file, self-contained browser app for translating English text into [Solresol](https://en.wikipedia.org/wiki/Solresol) — the musical constructed language invented by Jean-François Sudre in the 19th century — and playing it back with animated visuals and audio.

## What is Solresol?

Solresol is a constructed language built entirely from the seven solfège syllables: **Do Re Mi Fa Sol La Si** (sometimes **Ti**). Words are formed by combining these syllables (e.g. *dore* = "I/me", *mila* = "behold/voilà", *fado* = "what"). Because each syllable maps to a musical note, the language can be spoken, sung, played on an instrument, or represented as colors. 

Check out [omniglot](https://omniglot.com/writing/solresol.htm), [solresol.xyz](https://solresol.xyz/) or [wikipedia](https://en.wikipedia.org/wiki/Solresol) for more information.

## Solresol Experience Features

- **English → Solresol translation** in real time as you type, using an embedded 8,000-word dictionary derived from the MishaKlopukh corpus
- **Animated musical staff** with color-coded notes scrolling as the phrase plays
- **Per-syllable emphasis** — each note glows and enlarges as it plays
- **Full-page color wash** — the background shifts to the current note's color (rainbow: Do=red, Re=orange, Mi=yellow, Fa=green, Sol=blue, La=indigo, Si=violet)
- **Multiple instruments** — Piano (sampled), Marimba, Flute, Organ, Bell, Strings
- **Adjustable tempo** (40–160 BPM)
- **Shareable URLs** — clicking Play encodes text, instrument, and tempo into the URL; visiting that URL auto-plays
- **Audio download** — renders the phrase offline and exports a WAV file
- **Video download** — records a canvas animation of the playback as WebM

## Usage

### In the browser

Open `index.html` directly — no server required. It is entirely self-contained (dictionary embedded inline, audio via CDN).

1. Type English text in the input field. Translation updates as you type.
2. Click **▶ Play** to hear and see the Solresol rendering.
3. Click anywhere to pause; controls reappear.
4. Use the instrument selector and BPM slider to customize the sound.

### Development

- `node test.js` or `npm test` — run translator regression tests and generated-output checks.
- `node syncdict.js` or `npm run build` — regenerate `index.html` and `solresol-translator.js` from the shared translator core.
- `node syncdict.js --check` or `npm run sync:check` — fail when generated translator outputs are stale.

See [TESTING.md](TESTING.md) for the full test/build workflow and [TRANSLATION.md](TRANSLATION.md) for standalone library reuse.

### Sharing

Click **🔗 Copy URL** (or just press Play) to get a URL that encodes the current text, instrument, and tempo. Anyone opening that URL will see the same phrase and start playing automatically.

Example URL:
```
index.html?text=What+is+your+name&instrument=piano&tempo=72
```

### Downloading

- **⬇ Audio** — exports a `.wav` file of the current phrase rendered offline (no microphone needed)
- **⬇ Video** — records a `.webm` video of the color-animated playback using `MediaRecorder` (Chrome recommended)

## Syllables, Colors, Notes, Symbols

I've seen some different ASCII & Shavian glyphs used, but they don't match the official symbols as well, so I've made slight adjustments. As far as I know there is no official character/glyph mapping.

|  #   | Syllable | English IPA | Note |  Freq.  | Color  | ASCII | Shavian |                    Symbol                    |
| :--: | :------: | :---------: | :--: | :-----: | :----: | :---: | :-----: | :------------------------------------------: |
| `1`  |    Do    |    /doʊ/    |  C4  | 261.6Hz |  Red   |   o   |    𐑴    |  ![1-do-symbol](media/1-do-red-symbol.svg)   |
| `2`  |    Re    |    /ɹeɪ/    |  D4  | 293.7Hz | Orange |   l   |    𐑦    | ![2-re-symbol](media/2-re-orange-symbol.svg) |
| `3`  |    Mi    |    /miː/    |  E4  | 329.6Hz | Yellow |   n   |    𐑵    | ![3-mi-symbol](media/3-mi-yellow-symbol.svg) |
| `4`  |    Fa    |    /fɑː/    |  F4  | 349.2Hz | Green  |   \   |    𐑘    | ![4-fa-symbol](media/4-fa-green-symbol.svg)  |
| `5`  |   Sol    |   /soʊl/    |  G4  | 392.0Hz |  Blue  |   z   |    𐑯    | ![5-sol-symbol](media/5-sol-blue-symbol.svg) |
| `6`  |    La    |    /lɑː/    |  A4  | 440.0Hz | Indigo |   c   |    𐑤    | ![6-la-symbol](media/6-la-indigo-symbol.svg) |
| `7`  |    Si    |    /siː/    |  B4  | 493.9Hz | Violet |   j   |    𐑢    | ![7-si-symbol](media/7-si-violet-symbol.svg) |

## Technical Notes

- **Single file** — `index.html` (~200 KB, ~8 KB gzipped dictionary data)
- **[Tone.js](https://tonejs.github.io/)** (v14) for audio synthesis and [Salamander piano samples](https://github.com/Tonejs/audio/tree/master/salamander) 
- **No build step** — plain HTML, CSS, and vanilla JavaScript
- **localStorage** — instrument, tempo, and text persist across sessions
  - Clear local storage: `localStorage.clear()`

- **OfflineAudioContext** for WAV export (instrument synth only; sampler export uses PolySynth fallback)
- **MediaRecorder API** for WebM video export (Chrome/Edge; Firefox may vary)

## Basic Translations

For one and two syllable words are found in the following table.

| 2nd syll.→  1st syll. ↓ | None                  | -do                 | -re                               | -mi                 | -fa          | -sol             | -la                          | -si/-ti           |
| ----------------------- | :-----------------------: | :---------------------: | :-----------------------------------: | :---------------------: | :--------------: | :------------------: | :------------------------------: | :-------------------: |
| Do-                     | no, not, neither, nor     | (past)                  | I, me                                 | you [sg]                | he               | self, oneself        | one, someone                     | other                 |
| Re-                     | and, as well as           | my, mine                | (pluperfect)                          | your, yours [sg]        | his              | our, ours            | your, yours [pl]                 | their                 |
| Mi-                     | or, or even               | for, in order to/that   | who, which (rel. pron.), that (conj.) | (future)                | whose, of which  | well (adv.)          | here/there is, behold            | good evening/night    |
| Fa-                     | to                        | what?                   | with, jointly                         | this, that              | (cond.)          | why, for what reason | good, tasty, delectable          | much, very, extremely |
| Sol-                    | if                        | but                     | in, within                            | wrong, ill (adv.)       | because          | (imperative)         | perpetually, always, without end | thank, thanks         |
| La-                     | the                       | nothing, no one, nobody | by                                    | here, there             | bad              | never, at no time    | (present participle)             | of                    |
| Si-/Ti-                 | yes, okay, gladly, agreed | the same (thing)        | each, every                           | good morning/ afternoon | little, scarcely | mister, sir          | young man, bachelor              | (passive participle)  |

A unique feature of Solresol is that meanings can be inverted by reversing the syllables in words. For instance *fala* means good or tasty, and *lafa* means bad. Interruptions in the logical order of words in each category are usually caused by these reversible words.

---

* **Future Earth Scream Now - [The *Solresol* Birdsong Translator](https://www.researchcatalogue.net/view/940166/948790)** 
  * by Jim Lloyd | Journal for Acoustic Research | [Issue 25](https://jar-online.net/en/exposition/abstract/future-earth-scream-now-solresol-birdsong-translator)
  * ... *a ‘speculative fabulation’ on communication with birds* ...
* **[Close Encounters of the 3rd Kind](https://en.wikipedia.org/wiki/Close_Encounters_of_the_Third_Kind)**
  * November 16, 1977 | [Columbia Pictures](https://en.wikipedia.org/wiki/Columbia_Pictures) | [Steven Spielberg](https://en.wikipedia.org/wiki/Steven_Spielberg) | 135 minutes | USA
  * At the end [music and colors are used to communicate with the extra terrestrials](https://www.youtube.com/watch?v=AphKxQ2NsQo). While it may have been inspired by Solresol, it doesn't appear to provide any meaningful translation.

| **[AGPL](LICENSE.md) | [Credits](CREDITS.md)** | | [Wikipedia](https://en.wikipedia.org/wiki/Solresol) | [solresol.xyz](https://solresol.xyz/) | [omniglot](https://omniglot.com/writing/solresol.htm) | [xxiivv](https://wiki.xxiivv.com/site/solresol.html) | [dodona.be](https://dodona.be/en/activities/623167992/) | [Atlas Obscura](https://www.atlasobscura.com/articles/what-is-solresol) | [IETF](https://en.wikipedia.org/wiki/IETF_language_tag): `art-x-solresol`| [ISO 639-3](https://en.wikipedia.org/wiki/ISO_639-3): [`qso`](https://iso639-3.sil.org/code/qso)|
