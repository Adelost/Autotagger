const utils = require('./utils');

// utils.createSweLexicon(__dirname + '/../lexicons/saldo20v03.txt', 'swe');
// extracted(utils.tagFile(__dirname + '/../inputs/eng/txt/nameless.txt', 'eng'));
extracted(utils.tagFile(__dirname + '/../inputs/swe/txt-out/nameless.txt', 'swe'));

function extracted(taggedWords) {
  const words = utils.findKeywords(taggedWords);
  // const singleWords = words.filter(_ => !_[1].match(/ /)).splice(0, 20);
  // const compoundWords = words.filter(_ => _[1].match(/ /));
  console.log(words)
  // console.log(singleWords);
  // console.log(compoundWords);
  console.log('=====================');
}


