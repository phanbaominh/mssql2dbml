const P = require('parsimmon');
const {
  pLParen, pRParen, pComma, wss,
} = require('./base_parsers');

exports.prettyPrint = function (parser, test, isPrint) {
  let json;
  let tests = test;
  if (typeof test === 'string') tests = [test];
  try {
    tests.forEach(test => {
      json = parser.tryParse(test);
      if (isPrint) {
        console.log(JSON.stringify(json, null, 2));
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.makeNode = function (name) {
  return function (parser) {
    return P.seqMap(P.index, parser, P.index, (start, value, end) => {
      value.value.token = {
        start,
        end,
      };
      return value;
    }).skip(wss);
  };
};

exports.makeList = function (parser) {
  return P.seq(pLParen, parser.sepBy1(pComma), pRParen).skip(wss).map(value => value[1]);
};

exports.streamline = function (type) {
  return function (parser) {
    return parser.skip(wss).map(value => {
      return {
        type,
        value,
      };
    });
  };
};
