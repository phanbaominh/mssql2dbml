const P = require('parsimmon');
const { makeList } = require('./utils');
const { wss, pEqual } = require('./base_parsers');

const pRegularIdentifier = P.regexp(/^[\w@#][\w@#$]*/).skip(wss);
const pDQDelimitedIdentifier = P.regexp(/"[^"]*"/).skip(wss);
const pBracketDelimitedIdentifier = P.regexp(/\[[^\]]*\]/).skip(wss);
const pDelimitedIdentifier = P.alt(pDQDelimitedIdentifier, pBracketDelimitedIdentifier).skip(wss);
const pIdentifier = P.alt(pRegularIdentifier, pDelimitedIdentifier).skip(wss);

const pNumber = P.regexp(/[0-9]+(\.[0-9]+)?/).map(Number).skip(wss);
const pNumberList = makeList(pNumber);

const pOption = P.seq(pRegularIdentifier, pEqual, pRegularIdentifier);
const pOptionList = makeList(pOption);

module.exports = {
  pIdentifier,
  pRegularIdentifier,
  pNumber,
  pOptionList,
  wss,
  pNumberList,
};
