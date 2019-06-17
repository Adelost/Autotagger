module.exports = (w, lex) => {
  if (w.match(/(ing|en|ens|et|arna|ets|an|ant|anna|ent)$/)) return ['NN'];
  if (w.match(/(er|ar)$/)) return ['VB'];
  if (w.match(/(igt)$/)) return ['AB'];
  if (w.match(/(igt)$/)) return ['AB'];
  if (w === 'När') {
    console.log(w);
  }
  const match = w.match(/(.+)(a|n)$/);
  if (match) {
    const stem = match[1];
    const ss = lex[stem.toLowerCase()];
    if (ss) return [ss];
  }
  return undefined;
};
