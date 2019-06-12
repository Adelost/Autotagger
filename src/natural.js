const utils = require('./utils');

// utils.createLexicon(__dirname + '/../lexicons/saldo20v03.txt');
// utils.createLexicon(__dirname + '/../lexicons/saldo_smal.txt');
// const taggedWords = utils.loadStaggerFile(__dirname + '/../inputs/swe/conll/nameless.txt.conll');
const taggedWords = utils.tagFile(__dirname + '/../inputs/swe/txt-out/nameless.txt');
// const taggedWords = utils.tagFile(__dirname + '/../inputs/eng/txt/nameless.txt');

const words = utils.findKeywords(taggedWords);
const singleWords = words.filter(_ => !_[1].match(/ /)).splice(0, 20);
const compoundWords = words.filter(_ => _[1].match(/ /));
console.log(singleWords);
console.log(compoundWords);


