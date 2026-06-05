/**
 * Shared Solresol translation core.
 *
 * This file intentionally has no runtime dependencies so it can be embedded in
 * index.html, wrapped by solresol-translator.js, and required by Node tests.
 */
(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.SolresolCore = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const SYLLABLES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
  const LOWER_SYLLABLES = SYLLABLES.map(s => s.toLowerCase());
  const FALLBACK_MAX_SYLLABLES = 8;

  const EXTRA_ALIASES = {
    misolresol: ['welcome', 'welcoming', 'welcomed', 'welcomes', 'host', 'hospitable'],
  };

  const CONTRACTION_BASES = {
    "i'm": 'i',
    "you're": 'you',
    "we're": 'we',
    "they're": 'they',
    "he's": 'he',
    "she's": 'she',
    "it's": 'it',
    "that's": 'that',
    "what's": 'what',
    "who's": 'who',
    "where's": 'where',
    "there's": 'there',
    "i've": 'i',
    "you've": 'you',
    "we've": 'we',
    "they've": 'they',
    "i'll": 'i',
    "you'll": 'you',
    "he'll": 'he',
    "she'll": 'she',
    "it'll": 'it',
    "we'll": 'we',
    "they'll": 'they',
    "i'd": 'i',
    "you'd": 'you',
    "he'd": 'he',
    "she'd": 'she',
    "it'd": 'it',
    "we'd": 'we',
    "they'd": 'they',
    "can't": 'can',
    "cannot": 'can',
    "won't": 'will',
    "shan't": 'shall',
  };

  const NEGATIVE_CONTRACTIONS = new Set([
    "aren't", "couldn't", "didn't", "doesn't", "don't", "hadn't", "hasn't",
    "haven't", "isn't", "mightn't", "mustn't", "needn't", "shouldn't",
    "wasn't", "weren't", "wouldn't",
  ]);

  function normalizeEnglish(value) {
    return String(value)
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9'\s-]/g, '')
      .replace(/^-+|-+$/g, '')
      .trim();
  }

  function addUnique(list, value) {
    if (value && !list.includes(value)) list.push(value);
  }

  function splitDefinition(definition) {
    return String(definition || '')
      .split(/[;,/]|(?:\s+\bor\b\s+)|(?:\s+\band\b\s+)/i)
      .map(part => normalizeEnglish(part.replace(/\([^)]*\)/g, '')))
      .filter(Boolean);
  }

  function normalizeSolKey(value) {
    return String(value || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
  }

  function canonicalizeDictionary(source) {
    const bySol = {};

    if (Array.isArray(source)) {
      for (const entry of source) {
        if (!entry) continue;
        const sol = normalizeSolKey(entry.solresol || entry.sol || entry.key);
        if (!sol) continue;
        const aliases = Array.isArray(entry.english) ? entry.english
          : Array.isArray(entry.words) ? entry.words
          : splitDefinition(entry.definition || entry.english || '');
        for (const alias of aliases) {
          const normalized = normalizeEnglish(alias);
          if (normalized) {
            if (!bySol[sol]) bySol[sol] = [];
            addUnique(bySol[sol], normalized);
          }
        }
      }
    } else {
      for (const [english, solresol] of Object.entries(source || {})) {
        const sol = normalizeSolKey(solresol);
        const normalized = normalizeEnglish(english);
        if (!sol || !normalized) continue;
        if (!bySol[sol]) bySol[sol] = [];
        addUnique(bySol[sol], normalized);
      }
    }

    for (const [sol, aliases] of Object.entries(EXTRA_ALIASES)) {
      if (!bySol[sol]) bySol[sol] = [];
      for (const alias of aliases) addUnique(bySol[sol], normalizeEnglish(alias));
    }

    return Object.keys(bySol).sort().map(solresol => ({
      solresol,
      english: bySol[solresol].slice().sort(),
    }));
  }

  function buildIndexes(entries) {
    const englishToSol = {};
    const solToEnglish = {};
    for (const entry of entries) {
      solToEnglish[entry.solresol] = entry.english.slice();
      for (const alias of entry.english) {
        if (!englishToSol[alias]) englishToSol[alias] = entry.solresol;
      }
    }
    return { englishToSol, solToEnglish };
  }

  function splitSol(key) {
    const s = [];
    let i = 0;
    const clean = normalizeSolKey(key);
    while (i < clean.length) {
      if (clean.slice(i, i + 3) === 'sol') { s.push('Sol'); i += 3; }
      else if (clean.slice(i, i + 2) === 'do') { s.push('Do'); i += 2; }
      else if (clean.slice(i, i + 2) === 're') { s.push('Re'); i += 2; }
      else if (clean.slice(i, i + 2) === 'mi') { s.push('Mi'); i += 2; }
      else if (clean.slice(i, i + 2) === 'fa') { s.push('Fa'); i += 2; }
      else if (clean.slice(i, i + 2) === 'la') { s.push('La'); i += 2; }
      else if (clean.slice(i, i + 2) === 'si') { s.push('Si'); i += 2; }
      else i++;
    }
    return s;
  }

  function addCandidate(candidates, value) {
    const normalized = normalizeEnglish(value);
    if (normalized) addUnique(candidates, normalized);
  }

  function morphologyCandidates(clean) {
    const candidates = [];
    addCandidate(candidates, clean);

    if (CONTRACTION_BASES[clean]) addCandidate(candidates, CONTRACTION_BASES[clean]);
    if (NEGATIVE_CONTRACTIONS.has(clean)) {
      addCandidate(candidates, clean.replace(/n't$/, ''));
      addCandidate(candidates, clean.replace(/n't$/, 'e'));
    }
    if (clean.includes("'")) {
      const [base, suffix] = clean.split("'");
      if (suffix === 's' || suffix === 're' || suffix === 've' || suffix === 'll' || suffix === 'd' || suffix === 'm') {
        addCandidate(candidates, base);
      }
    }

    const words = candidates.slice();
    for (const word of words) {
      if (word.length > 4 && word.endsWith('ies')) addCandidate(candidates, word.slice(0, -3) + 'y');
      if (word.length > 4 && word.endsWith('ves')) {
        addCandidate(candidates, word.slice(0, -3) + 'f');
        addCandidate(candidates, word.slice(0, -3) + 'fe');
      }
      if (word.length > 4 && /(?:ses|xes|zes|ches|shes)$/.test(word)) addCandidate(candidates, word.slice(0, -2));
      if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) addCandidate(candidates, word.slice(0, -1));

      if (word.length > 5 && word.endsWith('ying')) addCandidate(candidates, word.slice(0, -5) + 'ie');
      if (word.length > 5 && word.endsWith('ing')) {
        const stem = word.slice(0, -3);
        addCandidate(candidates, stem);
        addCandidate(candidates, stem + 'e');
        if (/([bcdfghjklmnpqrstvwxyz])\1$/.test(stem)) addCandidate(candidates, stem.slice(0, -1));
      }
      if (word.length > 4 && word.endsWith('ied')) addCandidate(candidates, word.slice(0, -3) + 'y');
      if (word.length > 4 && word.endsWith('ed')) {
        const stem = word.slice(0, -2);
        addCandidate(candidates, stem);
        addCandidate(candidates, stem + 'e');
        if (/([bcdfghjklmnpqrstvwxyz])\1$/.test(stem)) addCandidate(candidates, stem.slice(0, -1));
      }

      if (word.length > 4 && word.endsWith('ier')) addCandidate(candidates, word.slice(0, -3) + 'y');
      if (word.length > 4 && word.endsWith('iest')) addCandidate(candidates, word.slice(0, -4) + 'y');
      if (word.length > 4 && word.endsWith('er')) addCandidate(candidates, word.slice(0, -2));
      if (word.length > 5 && word.endsWith('est')) addCandidate(candidates, word.slice(0, -3));
      if (word.length > 5 && word.endsWith('ly')) addCandidate(candidates, word.slice(0, -2));
      if (word.length > 7 && word.endsWith('ness')) addCandidate(candidates, word.slice(0, -4));
      if (word.length > 7 && word.endsWith('ment')) addCandidate(candidates, word.slice(0, -4));
      if (word.length > 7 && word.endsWith('tion')) addCandidate(candidates, word.slice(0, -4));
      if (word.length > 8 && word.endsWith('ation')) addCandidate(candidates, word.slice(0, -5));
      if (word.length > 7 && word.startsWith('un')) addCandidate(candidates, word.slice(2));
    }

    return candidates;
  }

  function fallbackSyllables(clean) {
    const letters = normalizeEnglish(clean).replace(/[^a-z0-9]/g, '');
    if (!letters) return [];
    const syllables = [];
    for (let i = 0; i < letters.length && syllables.length < FALLBACK_MAX_SYLLABLES; i++) {
      const code = letters.charCodeAt(i);
      const idx = (code + i) % SYLLABLES.length;
      syllables.push(SYLLABLES[idx]);
    }
    return syllables.length ? syllables : ['Do'];
  }

  function resolveToken(token, indexes) {
    const clean = normalizeEnglish(token).replace(/\s+/g, ' ');
    const candidates = morphologyCandidates(clean);
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const sol = indexes.englishToSol[candidate];
      if (sol) {
        const exact = i === 0 && candidate === clean;
        return {
          english: token,
          solresol: splitSol(sol),
          unknown: false,
          matchType: exact ? 'exact' : 'normalized',
          normalized: clean,
          base: candidate,
          fallback: false,
          solresolKey: sol,
        };
      }
    }

    const fallback = fallbackSyllables(clean || token);
    return {
      english: token,
      solresol: fallback,
      unknown: false,
      matchType: 'phonetic',
      normalized: clean,
      base: null,
      fallback: true,
      solresolKey: fallback.map(s => s.toLowerCase()).join(''),
    };
  }

  function createTranslator(dictionarySource) {
    const entries = canonicalizeDictionary(dictionarySource);
    const indexes = buildIndexes(entries);

    function ToSolReSol(text) {
      return String(text || '').trim().split(/\s+/).filter(Boolean).map(tok => resolveToken(tok, indexes));
    }

    function FromSolReSol(text) {
      return String(text || '').trim().split(/\s+/).filter(Boolean).map(word => {
        const key = normalizeSolKey(word);
        return indexes.solToEnglish[key] ? indexes.solToEnglish[key].slice() : [];
      });
    }

    return {
      ToSolReSol,
      FromSolReSol,
      splitSol,
      normalizeEnglish,
      morphologyCandidates,
      canonicalizeDictionary,
      buildIndexes,
      dictionaryEntries: entries,
      englishToSolresol: indexes.englishToSol,
      solresolToEnglish: indexes.solToEnglish,
    };
  }

  return {
    SYLLABLES,
    createTranslator,
    splitSol,
    normalizeEnglish,
    canonicalizeDictionary,
    buildIndexes,
  };
}));
