const P = require('parsimmon');
const { makeList, streamline } = require('./utils');
const B = require('./base_parsers');


const pRegularIdentifier = P.regexp(/^[\w@#][\w@#$]*/).skip(B.wss);
const pDQDelimitedIdentifier = P.regexp(/"[^"]*"/).skip(B.wss);
const pBracketDelimitedIdentifier = P.regexp(/\[[^\]]*\]/).skip(B.wss);
const pDelimitedIdentifier = P.alt(pDQDelimitedIdentifier, pBracketDelimitedIdentifier).skip(B.wss);
const pIdentifier = P.alt(pRegularIdentifier, pDelimitedIdentifier).skip(B.wss);

const pNumber = P.regexp(/[0-9]+(\.[0-9]+)?/).map(Number).thru(streamline('number'));
const pNumberList = makeList(pNumber);

const pOption = P.seq(pRegularIdentifier, B.pEqual, pRegularIdentifier);
const pOptionList = makeList(pOption);

const pFunctionParam = P.alt(pNumber, pIdentifier);
const pFunction = P.seq(pIdentifier, makeList(pFunctionParam));

const pDotDelimitedName = P.sepBy1(pIdentifier, P.string('.'));

// SQL SERVER do not support boolean literal
const pString = P.regexp(/'[^']*'/).thru(streamline('string')).map(value => {
  const stringLiteral = value.value;
  value.value = stringLiteral.slice(1, stringLiteral.length - 1);
  return value;
});
const pUnicode = P.seq(P.string('N'), pString).thru(streamline('unicode'));
const pBinary = P.regexp(/0x[A-F0-9]*/).thru(streamline('binary'));
const pScience = P.regexp(/[+-]+[0-9]+(\.[0-9E]+)?/).thru(streamline('science'));
const pMoney = P.seq(P.regexp(/[+-]\$/), pNumber).thru(streamline('money'));
const pSigned = P.seq(P.regexp(/[+-]/), pNumber).thru(streamline('signed'));
const pConst = P.alt(pString, pUnicode, pBinary, pScience, pMoney, pSigned, pNumber);

const pKeywordPKOrUnique = P.alt(
  B.pKeywordPrimaryKey.result({ type: 'pk', value: true }),
  B.pKeywordUnique.result({ type: 'unique', value: true }),
).skip(B.wss);
const pKeywordClusteredOrNon = P.alt(B.pKeywordClustered, B.pKeywordNonclustered).skip(B.wss);
module.exports = {
  pIdentifier,
  pRegularIdentifier,
  pNumber,
  pOptionList,
  pNumberList,
  pFunction,
  pDotDelimitedName,
  pDelimitedIdentifier,
  pKeywordPKOrUnique,
  pKeywordClusteredOrNon,
  pConst,
};
