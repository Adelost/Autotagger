const HAS_LETTER = `[A-Za-zÀ-ÖØ-öø-ÿ0-9]`;
const HAS_WORD = `${HAS_LETTER}(${HAS_LETTER}|-|:|'|[.]${HAS_LETTER})*(${HAS_LETTER}|')*`;
const HAS_EMAIL = `${HAS_WORD}@${HAS_WORD}\\.${HAS_WORD}`;
const HAS_CLOCK = '(0[0-9]|1[0-9]|2[0-3]|[0-9])(:|.)[0-5][0-9]';
const HAS_SPECIAL = `(\\. \\. \\.|\\.\\.\\.|${HAS_CLOCK}|${HAS_EMAIL})`;
const IS_WORD = `^${HAS_WORD}$`;
// const HAS_SEPARATOR = `([ .,!?:;"»\r\n])`;
// const RE_HAS_SEPARATOR = new RegExp(HAS_SEPARATOR);
const RE_HAS_WORD = new RegExp(HAS_WORD);
const RE_IS_WORD = new RegExp(IS_WORD);
const RE_HAS_SPECIAL = new RegExp(HAS_SPECIAL);
const RE_IS_SPECIAL = new RegExp(`^${HAS_SPECIAL}$`);
const RE_IS_SEP = new RegExp(`^[.,:;!?'"-]$`);
//
// const foo = 'ays in the greatest secrecy. ... He preferred that we - I mean\n'.match(RE_HAS_SPECIAL);
// console.log(foo);
// console.log(foo);

// const match = `Ministry.'`.match(RE_HAS_WORD);

function normalizeText(s) {
  s = s.replace(/[‘’]/g, `'`);
  s = s.replace(/[“”]/g, `"`);
  s = s.replace(/[—–]/g, `-`);
  s = s.replace(/[»]/g, `"`);
  return s;
}

function keep(input, out) {
  out.push(input);
}

// eslint-disable-next-line
function skip() {
}

function lastEq(list, re) {
  const last = list[list.length - 1];
  return last && !!last.match(re);
}

function joinAbbreviations(words, lex) {
  const out = [];
  for (let i = 0; i < words.length; i += 1) {
    const curr = words[i];
    if (curr !== '.') {
      out.push(curr);
      continue;
    }
    const prev = words[i - 1];
    if (!prev) continue;
    const next = words[i + 1];
    const probe = prev + curr;
    if (curr === 'tournament.') {
      return curr;
    }
    if (isAbbreviation(probe, lex, prev, next)) {
      out[out.length - 1] = probe;
      continue;
    }
    out.push(curr);
  }
  return out;
}

function isAbbreviation(word, lex, prev, next) {
  if (!word.match(/\.$/)) return false;
  if (lex[word] || (word.length === 2 && startsWithUppercase(word))) {
    return true;
  }
  if (!prev || !next) return false;
  return !!(isWord(prev) && (startsWithLowercase(next) || isNonBreakingSymbol(next)));
}


function joinLineBreaks(words) {
  const out = [];
  for (let i = 0; i < words.length; i += 1) {
    const curr = words[i];
    if (curr !== '\n') {
      out.push(curr);
      continue;
    }
    const prev = words[i - 1];
    const next = words[i + 1];
    if (isWord(prev) && isWord(next) && startsWithUppercase(next)) {
      out.push('.');
    }
  }
  return out;
}

function joinSentences(words) {
  const out = [];
  for (let i = 0; i < words.length; i += 1) {
    const curr = words[i];
    const next = words[i + 1];
    if (curr.match(/[.!?]/)) {
      const prev = words[i - 1];
      if (prev) {
        out[out.length - 1] += curr;
        continue;
      }
    }
    if (isNonBreaking(curr) && isNonBreaking(next)) {
      const delim = next.match(/[,:;]/) ? '' : ' ';
      words[i + 1] = curr + delim + next;
      continue;
    }
    out.push(curr);
  }
  return out;
}

class Tagger {
  constructor(lang) {
    this.lexicon = require(`../langs/lexicons/${lang}.json`);
    this.grammar = require(`../langs/grammars/${lang}`);
  }

  lex(input) {
    let words = [];
    input = normalizeText(input);
    lexSpecials(input, words);

    function lexSpecials(input, out) {
      matchBy(input, RE_HAS_SPECIAL, keep, lexWords).forEach(_ => out.push(_));
    }

    function lexWords(input, out) {
      matchBy(input, RE_HAS_WORD, keep, lexSep).forEach(_ => out.push(_));
    }

    function lexSep(s, out) {
      s = s.replace(/\r\n/g, '\n');
      s = s.replace(/\n+/g, '\n');
      s = s.replace(/[ \t]/g, '');
      const xs = s.split('');
      xs.forEach(s => {
        if (!s) return;
        out.push(s);
      });
    }

    words = joinAbbreviations(words, this.lexicon);
    words = joinLineBreaks(words);
    // words = joinSentences(words);

    return words;
  }

  tag(words) {
    return words.map((word) => {
      let tags = this.lexicon[word];
      if (!tags) tags = this.lexicon[word.toLowerCase()];
      if (!tags) tags = this.grammar(word, this.lexicon);
      if (tags && startsWithUppercase(word)) {
        const lowerTags = this.lexicon[word.toLowerCase()];
        if (lowerTags) tags = lowerTags;
      }
      if (!tags) tags = ['?'];
      return [word, tags[0], tags[0]];
    });
  }

  // isAbbreviation() {
  //
  // }
}

exports.Tagger = Tagger;

function startsWithUppercase(word) {
  if (!isWord(word)) return false;
  const first = word[0];
  return first === first.toUpperCase();
}

function startsWithLowercase(word) {
  if (!isWord(word)) return false;
  const first = word[0];
  return first === first.toLowerCase();
}

function isWord(word) {
  return word && !!word.match(RE_IS_WORD);
}

function isNonBreaking(word) {
  return word && (isWord(word) || isNonBreakingSymbol(word));
}

function isNonBreakingSymbol(word) {
  return word && word.match(/^[, :;]$/);
}

function matchBy(input, re, onMatch, onNonMatch) {
  let part = input;
  const out = [];
  while (part) {
    const matches = part.match(re);
    if (!matches) {
      onNonMatch(part, out);
      break;
    }
    const match = matches[0];
    if (!match) {
      return;
    }
    if (matches.index) {
      onNonMatch(part.substr(0, matches.index), out);
    }
    onMatch(match, out);
    part = part.substr(matches.index + match.length);
  }
  return out;
}

function separateBy(input, re) {
  return matchBy(input, re, (_, out) => out.push(_), (_, out) => out.push(_));
}
