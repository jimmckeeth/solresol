# Solresol Experience

A single-file, self-contained browser app for translating English text into [Solresol](https://en.wikipedia.org/wiki/Solresol) — the musical constructed language invented by Jean-François Sudre in the 19th century — and playing it back with animated visuals and audio.

## What is Solresol?

Solresol is a constructed language built entirely from the seven solfège syllables: **Do Re Mi Fa Sol La Si**. Words are formed by combining these syllables (e.g. *dore* = "I/me", *mila* = "behold/voilà", *fado* = "what"). Because each syllable maps to a musical note, the language can be spoken, sung, played on an instrument, or represented as colors.

## Features

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
3. Click anywhere (or the Pause button) to pause; controls reappear.
4. Use the instrument selector and BPM slider to customize the sound.

### Sharing

Click **🔗 Copy URL** (or just press Play) to get a URL that encodes the current text, instrument, and tempo. Anyone opening that URL will see the same phrase and start playing automatically.

Example URL:
```
index.html?text=What+is+your+name&instrument=piano&tempo=72
```

### Downloading

- **⬇ Audio** — exports a `.wav` file of the current phrase rendered offline (no microphone needed)
- **⬇ Video** — records a `.webm` video of the color-animated playback using `MediaRecorder` (Chrome recommended)

## Color System

| Syllable | Note | Color   |
|----------|------|---------|
| Do       | C4   | Red     |
| Re       | D4   | Orange  |
| Mi       | E4   | Yellow  |
| Fa       | F4   | Green   |
| Sol      | G4   | Blue    |
| La       | A4   | Indigo  |
| Si       | B4   | Violet  |

## Technical Notes

- **Single file** — `index.html` (~200 KB, ~8 KB gzipped dictionary data)
- **Tone.js** (v14) for audio synthesis and Salamander piano samples
- **No build step** — plain HTML, CSS, and vanilla JavaScript
- **localStorage** — instrument, tempo, and text persist across sessions
- **OfflineAudioContext** for WAV export (instrument synth only; sampler export uses PolySynth fallback)
- **MediaRecorder API** for WebM video export (Chrome/Edge; Firefox may vary)

## Dictionary

The Solresol dictionary is embedded inline from the [MishaKlopukh/solresol-language](https://github.com/MishaKlopukh/solresol-language) corpus, reverse-mapped from Solresol→English to English→Solresol. Common function words (the, is, what, etc.) use hand-curated overrides for accuracy.

## License

MIT
