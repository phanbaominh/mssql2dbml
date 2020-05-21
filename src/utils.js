const P = require('parsimmon');
const {
  LParen, RParen, Comma,
} = require('./base_parsers');

const wss = require('./whitespaces');

exports.prettyPrint = function (parser, test, isPrint) {
  let json;
  let tests = test;
  if (typeof test === 'string') tests = [test];

  tests.forEach(test => {
    json = parser.tryParse(test);
    try {
      if (isPrint) {
        console.log(JSON.stringify(json, null, 2));
      }
    } catch (error) {
      console.log(error.message);
    }
  });
};

exports.makeNode = function () {
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
  return P.seq(LParen, parser.sepBy1(Comma), RParen).skip(wss).map(value => value[1]);
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
