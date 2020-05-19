const P = require('parsimmon');
const { makeList } = require('./utils');
const B = require('./base_parsers');


const pRegularIdentifier = P.regexp(/^[\w@#][\w@#$]*/).skip(B.wss);
const pDQDelimitedIdentifier = P.regexp(/"[^"]*"/).skip(B.wss);
const pBracketDelimitedIdentifier = P.regexp(/\[[^\]]*\]/).skip(B.wss);
const pDelimitedIdentifier = P.alt(pDQDelimitedIdentifier, pBracketDelimitedIdentifier).skip(B.wss);
const pIdentifier = P.alt(pRegularIdentifier, pDelimitedIdentifier).skip(B.wss);

const pNumber = P.regexp(/[0-9]+(\.[0-9]+)?/).map(Number).skip(B.wss);
const pNumberList = makeList(pNumber);

const pOption = P.seq(pRegularIdentifier, B.pEqual, pRegularIdentifier);
const pOptionList = makeList(pOption);

const pFunctionParam = P.alt(pNumber, pIdentifier);
const pFunction = P.seq(pIdentifier, makeList(pFunctionParam));

const pColumnName = P.sepBy1(pIdentifier, P.string('.'));

const pKeywordPKOrUnique = P.alt(B.pKeywordPrimaryKey, B.pKeywordUnique).skip(B.wss);
const pKeywordClusteredOrNon = P.alt(B.pKeywordClustered, B.pKeywordNonclustered).skip(B.wss);
module.exports = {
  pIdentifier,
  pRegularIdentifier,
  pNumber,
  pOptionList,
  pNumberList,
  pFunction,
  pColumnName,
  pDelimitedIdentifier,
  pKeywordPKOrUnique,
  pKeywordClusteredOrNon,
};
