const P = require('parsimmon');
const {
  pLParen, pRParen, pComma, wss,
} = require('./base_parsers');

exports.prettyPrint = function (json, isPrint) {
  if (isPrint) {
    console.log(JSON.stringify(json, null, 2));
  }
};

exports.makeNode = function (name) {
  return function (parser) {
    return P.seqMap(P.index, parser, P.index, (start, value, end) => {
      return {
        type: name,
        value,
        token: {
          start,
          end,
        },
      };
    }).skip(wss);
  };
};

exports.makeList = function (parser) {
  return P.seq(pLParen, parser.sepBy(pComma), pRParen).skip(wss);
};
