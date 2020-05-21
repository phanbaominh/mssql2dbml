const P = require('parsimmon');
const { keywords } = require('./base_utils');
const wss = require('./whitespaces');

exports.pExpression = P((input, i) => {
  const slicedInput = input.slice(i);
  let minIndex = Infinity;
  keywords.push(/(\r\n|\r|\n)/);
  keywords.forEach(keyword => {
    const matchResult = slicedInput.match(keyword);
    if (matchResult && matchResult.index < minIndex) {
      minIndex = matchResult.index;
    }
  });
  return P.makeSuccess(minIndex, input.slice(i, minIndex - i).trimRight());
}).skip(wss);
