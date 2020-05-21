const P = require('parsimmon');
const { makeList, streamline } = require('./utils');
const BP = require('./base_parsers');
const wss = require('./whitespaces');

const Lang = P.createLanguage({

  pColumnNames: (r) => makeList(P.seq(r.pIdentifier, r.pKeywordAscOrDesc.fallback(null))),

  pDotDelimitedName: (r) => P.sepBy1(r.pIdentifier, P.string('.')),

  pOptionList: (r) => makeList(r.pOption),
  pOption: (r) => P.seq(r.pRegularIdentifier, BP.Equal, P.alt(r.pRegularIdentifier, r.pString)),

  pConst: (r) => P.alt(r.pString, r.pUnicode, r.pBinary, r.pScience, r.pMoney, r.pSigned, r.pNumber),

  pMoney: (r) => P.seq(P.regexp(/[+-]\$/), r.pNumber).thru(streamline('money')),
  pSigned: (r) => P.seq(P.regexp(/[+-]/), r.pNumber).thru(streamline('signed')),
  pUnicode: (r) => P.seq(P.string('N'), r.pString).thru(streamline('unicode')),
  pString: () => P.regexp(/'[^']*'/).thru(streamline('string')).map(value => {
    const stringLiteral = value.value;
    value.value = stringLiteral.slice(1, stringLiteral.length - 1);
    return value;
  }),
  pNumberList: (r) => makeList(r.pNumber),
  pNumber: () => P.regexp(/[0-9]+(\.[0-9]+)?/).map(Number).thru(streamline('number')),
  pBinary: () => P.regexp(/0x[A-F0-9]*/).thru(streamline('binary')),
  pScience: () => P.regexp(/[+-]+[0-9]+(\.[0-9E]+)?/).thru(streamline('science')),

  pIdentifier: (r) => P.alt(r.pRegularIdentifier, r.pDelimitedIdentifier).skip(wss),
  pDelimitedIdentifier: (r) => P.alt(r.pDQDelimitedIdentifier, r.pBracketDelimitedIdentifier).skip(wss),

  pRegularIdentifier: () => P.regexp(/^[\w@#][\w@#$]*/).skip(wss),
  pDQDelimitedIdentifier: () => P.regexp(/"[^"]*"/).skip(wss),
  pBracketDelimitedIdentifier: () => P.regexp(/\[[^\]]*\]/).skip(wss),

  pFunction: (r) => P.seq(r.ppIdentifier, makeList(r.ppFunctionParam)),
  pFunctionParam: (r) => P.alt(r.ppNumber, r.ppIdentifier),

  // SQL SERVER do not support boolean literal

  pKeywordPKOrUnique: () => P.alt(
    BP.KeywordPrimaryKey.result({ type: 'pk', value: true }),
    BP.KeywordUnique.result({ type: 'unique', value: true }),
  ),
  pKeywordClusteredOrNon: () => P.alt(BP.KeywordClustered, BP.KeywordNonclustered),
  pKeywordAscOrDesc: () => P.alt(BP.KeywordAsc, BP.KeywordDesc),
});

module.exports = Lang;
