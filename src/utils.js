const fs = require('fs');
const pos = require('./pos');

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

exports.tagFile = function (path, lang) {
  let input = fs.readFileSync(path, 'utf8');
  const tagger = new pos.Tagger(lang);
  const words = tagger.lex(input);
  return tagger.tag(words);
};

exports.findKeywords = function (words) {
  fixNames(words);
  fixCompoundNouns(words);
  fixOfTitles(words);
  fixCompoundNouns(words);
  words = mergeNNP(words);
  words = suffixCleanup(words);
  words = words.filter(_ => isNnp(_[1]));
  words = countKeywords(words);
  promoteCompoundWords(words);
  promoteHeadlineWords(words);
  words = words.sort((a, b) => 1 * (b[0] - a[0]));
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
  words.forEach((word, i) => {
    const next = words[i + 1];
    if (next && word[1] === 'NNP' && isTitle(next[0])) {
      next[1] = 'NNP';
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

function fixNames(words) {
  words.forEach((word, i) => {
    const prev = words[i - 1];
    if (isTitle(word[0]) && prev && isWord(prev[0]) && word[1] !== 'PRP') {
      word[1] = 'NNP';
    }
  });
}

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

exports.createSweLexicon = function (path) {
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
    nl: 'CD',
    pn: 'PRP'
  };
  const lex = {};
  lines.forEach(line => {
    const l = line.split(/\t/);
    if (l.length < 5) {
      return;
    }
    const key = l[4];
    const rawTag = l[5];
    const tag = tagMap[rawTag] || rawTag;
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
  Object.entries(additionalSwe()).forEach(([tag, value]) => {
    const words = value.split(' ');
    words.forEach((key) => {
      let tags = lex[key];
      if (!tags) {
        tags = {};
        lex[key] = tags;
      }
      tags[tag] = true;
    });
  });
  Object.entries(lex).forEach(([key, value]) => {
    lex[key] = Object.keys(value);
  });
  const text = JSON.stringify(lex, null, 0)
    .replace(/{(.*)}/, '{\n$1\n}')
    .replace(/(],)/g, '$1\n')
    .split('\n').map(l => {
      return l.replace(/(^")/, '  $1')
        .replace(/(:)(\[)/, '$1 $2');
    }).join('\n');
  fs.writeFileSync(`${__dirname}/../lexicons/swe.json`, text, 'utf8');
};

function additionalSwe() {
  return {
    PRP: 'jag du han hon hen den det man en vi ni de dom'
      + ' mig mej dig dej honom han henne hen henom den det en sig sej oss er eder dem dom sig sej'
      + ' min din sin vår våran er eran eder sin'
      + ' mitt ditt hans hennes hens dess ens sitt vårt vårat ert erat edert deras sitt'
      + ' mina dina sina våra era edra sina',
    PP$: 'min mitt mina vår vårt våra din ditt dina er ert era sin sitt sina sin sitt sina',
    WDT: 'hans hennes dess detta denna denne dessa'
  };
}

exports.createEngLexicon = function (path) {
  const not = {};

  const rawLex = require(path);
  const lex = {};
  Object.keys(rawLex).sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  }).filter(_ => {
    if (_.match(/\.$/)) {
      if (_.match(/\./g).length === 1) {
        return true;
      }
    }
    return false;
  }).forEach(_ => lex[_] = rawLex[_]);
  const text = JSON.stringify(lex, null, 0)
    .replace(/{(.*)}/, '{\n$1\n}')
    .replace(/(],)/g, '$1\n')
    .split('\n').map(l => {
      return l.replace(/(^")/, '  $1')
        .replace(/(:)(\[)/, '$1 $2');
    }).join('\n');
  fs.writeFileSync(path + '2.json', text, 'utf8');
};
