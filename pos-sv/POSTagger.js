/*!
 * jsPOS
 *
 * Copyright 2010, Percy Wegmann
 * Licensed under the LGPLv3 license
 * http://www.opensource.org/licenses/lgpl-3.0.html
 */

var TransformationRules = require('./BrillTransformationRules');
var transformationRules = new TransformationRules();

module.exports = POSTagger;

function POSTagger() {
  this.lexicon = require('../lexicons/swedish');
}

POSTagger.prototype.wordInLexicon = function (word) {
  var ss = this.lexicon[word];
  if (ss != null) { return true; }
  // 1/22/2002 mod (from Lisp code): if not in hash, try lower case:
  if (!ss) { ss = this.lexicon[word.toLowerCase()]; }
  if (ss) { return true; }
  return false;
};

function startsWithUppercase(word) {
  const first = word[0];
  if (!first.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/)) {
    return false;
  }
  return first === first.toUpperCase();
}

function isWord(text) {
  return !!text.match(/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/);
}

function removeNnpFromLs(tags) {
  // if (tags && tags[0] === 'NNP') {
  //   if (tags.find((_) => _ === 'LS')) {
  //     tags.shift();
  //   }
  // }
}

POSTagger.prototype.tag = function (words) {
  var taggedSentence = new Array(words.length);

  // Initialise taggedSentence with words and initial categories
  for (var i = 0, size = words.length; i < size; i++) {
    const word = words[i];
    if (word === `Deneb`) {
      console.log('word', word);
    }
    taggedSentence[i] = new Array(2);
    taggedSentence[i][0] = words[i];
    // lexicon maps a word to an array of possible categories
    var ss = this.lexicon[words[i]];
    // 1/22/2002 mod (from Lisp code): if not in hash, try lower case:
    if (!ss) { ss = this.lexicon[words[i].toLowerCase()]; }
    if (!ss && (words[i].length === 1)) { taggedSentence[i][1] = words[i] + '^'; }
    // We need to catch scenarios where we pass things on the prototype
    // that aren't in the lexicon: "constructor" breaks this otherwise
    removeNnpFromLs(ss);
    if (!ss || (Object.prototype.toString.call(ss) !== '[object Array]')) {
      // if (startsWithUppercase(taggedSentence[i][0]) && taggedSentence[i - 1] && isWord(taggedSentence[i - 1][0])) {
      if (startsWithUppercase(taggedSentence[i][0])) {
        taggedSentence[i][1] = 'NNP';
      } else {
        taggedSentence[i][1] = 'NN';
      }
    } else { taggedSentence[i][1] = ss[0]; }
  }

  // Apply transformation rules
  taggedSentence.forEach(function (taggedWord, index) {
    transformationRules.getRules().forEach(function (rule) {
      rule(taggedSentence, index);
    });
  });
  return taggedSentence;
};

POSTagger.prototype.extendLexicon = function (lexicon) {
  for (var word in lexicon) {
    if (!this.lexicon.hasOwnProperty(word)) {
      this.lexicon[word] = lexicon[word];
    }
  }
};

// console.log(new POSTagger().tag(["i", "went", "to", "the", "store", "to", "buy", "5.2", "gallons", "of", "milk"]));
