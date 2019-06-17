const utils = require('./utils');

// utils.createEngLexicon(`${__dirname}/../langs/lexicons/eng.json`);
// utils.createSweLexicon(__dirname + '/../lexicons/saldo20v03.txt', 'swe');
// extracted(utils.tagFile(__dirname + '/../inputs/eng/txt/it.txt', 'eng'));

extracted(utils.tagFile(__dirname + '/../inputs/swe/txt-out/bil-renault.txt', 'swe'));

function extracted(taggedWords) {
  // taggedWords = taggedWords.filter(_ => _[0].match(/\./) && !['.', '...', '. . .', 'Mr.', 'Mrs.', 'St.'].includes(_[0]));
  // console.log(taggedWords);

  let words = utils.findKeywords(taggedWords);

  const singleWords = words.filter(_ => !_[1].match(/ /)).splice(0, 20);
  const compoundWords = words.filter(_ => _[1].match(/ /));
  // console.log(words);
  console.log(singleWords);
  console.log(compoundWords);
  // console.log('=====================');
}


