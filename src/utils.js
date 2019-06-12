const fs = require('fs');
const pos = require('../pos-sv');

exports.loadStaggerFile = function (path) {
  const input = fs.readFileSync(path, 'utf8');
  const words = [];
  const lines = input.split(/\n/);
  const tagMap = {
    PM: 'NNP',
    UO: 'NN',
    PP: 'IN'
  };
  lines.forEach(line => {
    const l = line.split(/\t/);
    const key = l[1];
    const rawTag = l[3];
    if (!rawTag) {
      return;
    }
    let tag = tagMap[rawTag];
    if (!tag) {
      tag = rawTag.toLowerCase();
    }
    words.push([key, tag]);
  });
  return words;
};

exports.tagFile = function (path) {
  let input = fs.readFileSync(path, 'utf8');

  input = input.replace(/[’‘’]/g, `'`);
  input = input.replace(/[“”]/g, `"`);
  input = input.replace(/[—]/g, `-`);
  input = input.replace(/[…»]/g, `. `);
  input = input.replace(/(\n|\s\s|\t)+/g, `. `);
  input = grammarCleanup(input);

  const words = new pos.Lexer().lex(input);
  const tagger = new pos.Tagger();
  return tagger.tag(words);
};

exports.findKeywords = function (words) {
  fixTheNouns(words);
  fixCompoundNouns(words);
  fixOfTitles(words);
  fixCompoundNouns(words);
  words = mergeNNP(words);
  words = suffixCleanup(words);
  words = words.filter(_ => isNnp(_[1]));
  words = countKeywords(words);
  promoteCompoundWords(words);
  promoteHeadlineWords(words);
  words = words.sort((a, b) => b[0] - a[0]);
  return words;
};

function countKeywords(words) {
  const wordCounts = {};
  words = words.filter(_ => {
    const word = _[0];
    if (!wordCounts[word]) {
      wordCounts[word] = 1;
      return true;
    }
    wordCounts[word] += 1;
    return false;
  });
  words = words.map(_ => {
    const name = _[0];
    const count = wordCounts[name];
    return [count, name];
  });
  return words;
}

function suffixCleanup(words) {
  return words.map(word => {
    word[0] = word[0].replace(/('s|'| I)$/, ``);
    return word;
  });
}

function grammarCleanup(input) {
  input = input.replace(/('re|'ll|'t|'m|'ve|D'you)\b/g, `,`);
  input = input.replace(/(Mister|Mr|Miss|Ms|Master|Professor|Dear|Famous|Lord|President|Ser)/g, `,`);
  return input;
}

function isWord(text) {
  return !!text.match(/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/);
}

function isTitle(text) {
  return isWord(text) && startsWithUppercase(text);
}

function fixOfTitles(words) {
  words.forEach((w0, i) => {
    if (w0[1] === 'NNP') {
      const w1 = words[i + 1];
      if (!w1) return;
      if (w1[1] === 'IN') {
        const w2 = words[i + 2];
        if (!w2) return;
        if (isTitle(w2[0])) {
          w1[1] = `NNP`;
          return;
        }
        const w3 = words[i + 3];
        if (!w3) return;
        if (w2[1] === 'DT' && isTitle(w3[0])) {
          w1[1] = `NNP`;
          w2[1] = `NNP`;
          w3[1] = `NNP`;
        }
      }
    }
  });
}

function fixCompoundNouns(words) {
  words.forEach((w0, i) => {
    const w1 = words[i + 1];
    if (w1 && w0[1] === 'NNP' && isTitle(w1[0])) {
      w1[1] = 'NNP';
    }
  });
}

function mergeNNP(words) {
  return words.filter((word, i) => {
    const tag = word[1];
    const next = words[i + 1];
    const nextTag = next && next[1];
    if (isNnp()) {
      next[0] = `${word[0]} ${next[0]}`;
      return false;
    }
    if (isNnp(tag) && next && (isNnp(nextTag) || isTitle(next[0]))) {
      next[0] = `${word[0]} ${next[0]}`;
      next[1] = 'NNP';
      return false;
    }
    return true;
  });
}

function fixTheNouns(words) {
  words.forEach((word, i) => {
    const next = words[i + 1];
    if (word[1] === 'DT' && next && isTitle(next[0])) {
      next[1] = 'NNP';
    }
  });
}

function startsWithUppercase(word) {
  const first = word[0];
  if (!first.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/)) {
    return false;
  }
  return first === first.toUpperCase();
}


function removeOverlappingWords(words) {
  const counts = {};
  words.forEach(_ => {
    const words = _[1].split(' ');
    words.forEach(word => {
      if (!counts[word]) {
        counts[word] = 1;
      } else {
        counts[word] += 1;
      }
    });
  });
  return words.filter(_ => {
    const words = _[1].split(' ');
    if (words.length === 1) {
      const word = words[0];
      if (counts[word] !== 1) {
        return false;
      }
    }
    return true;
  });
}

exports.removeOverlappingWords = removeOverlappingWords;


function promoteCompoundWords(words) {
  const counts = {};
  words.forEach(word => {
    const count = word[0];
    const words = word[1].split(' ');
    words.forEach(word => {
      if (!counts[word]) {
        counts[word] = count;
      } else {
        counts[word] += count;
      }
    });
  });
  words.forEach(word => {
    const baseCount = word[0];
    if (word[1] === 'Dylath-Leen Carter') {
      // console.log(word);
    }
    const words = word[1].split(' ');
    if (words.length > 1) {
      const wordCounts = words.map(word => counts[word]).sort((a, b) => a - b);
      const wordCount = wordCounts.reduce((a, b) => a + b, 0);
      let score = Math.ceil(wordCount / wordCounts.length);
      if (baseCount === 1) score = Math.min(score, 4);
      if (baseCount === 2) score = Math.min(score, 10);
      score = Math.min(score, baseCount * 10);
      word[0] = score;
    }
  });
}

function promoteHeadlineWords(words) {
  const count = Math.min(words.length, 10);
  for (let i = 0; i < count; i += 1) {
    words[i][0] += Math.ceil(5 - i / 2);
  }
}

function isNnp(tag) {
  return ['NNP'].includes(tag);
}

exports.createLexicon = function (path) {
  const lines = fs.readFileSync(path, 'utf8').split(/\n/);
  const tagMap = {
    pm: 'NNP',
    pmm: 'NNP',
    pma: 'NNP',
    nnm: 'NN',
    uo: 'NN',
    nn: 'NN',
    pp: 'IN',
    av: 'JJ',
    nna: 'NN',
    vb: 'VB',
    vbm: 'VB',
    in: 'UH',
    ab: 'RB',
    abm: 'RB',
    nl: 'CD'
  };
  const lex = {};
  lines.forEach(line => {
    const l = line.split(/\t/);
    if (l.length < 5) {
      return;
    }
    const key = l[4];
    const rawTag = l[5];
    const tag = tagMap[rawTag] || '?';
    if (rawTag === undefined) {
      console.log(key, rawTag);
    }
    let tags = lex[key];
    if (!tags) {
      tags = {};
      lex[key] = tags;
    }
    tags[tag] = true;
  });
  Object.entries(lex).forEach(([key, value]) => {
    lex[key] = Object.keys(value).reverse();
  });
  fs.writeFileSync(path + '.json', JSON.stringify(lex, null, 2), 'utf8');
};
