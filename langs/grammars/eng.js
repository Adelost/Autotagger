module.exports = (w) => {
  if (w.match(/(ing)$/)) {
    return ['VB'];
  }
  return undefined;
};
