const P = require('parsimmon');
const { makeList, streamline } = require('./utils');
const BP = require('./base_parsers');
const wss = require('./whitespaces');

const Lang = P.createLanguage({

  ColumnNames: (r) => makeList(r.Identifier),
  DotDelimitedName: (r) => P.sepBy1(r.Identifier, P.string('.')),

  OptionList: (r) => makeList(r.Option),
  Option: (r) => P.seq(r.RegularIdentifier, BP.Equal, P.alt(r.RegularIdentifier, r.String)),

  Const: (r) => P.alt(r.String, r.Unicode, r.Binary, r.Science, r.Money, r.Signed, r.Number),

  Money: (r) => P.seq(P.regexp(/[+-]\$/), r.Number).thru(streamline('money')),
  Signed: (r) => P.seq(P.regexp(/[+-]/), r.Number).thru(streamline('signed')),
  Unicode: (r) => P.seq(P.string('N'), r.String).thru(streamline('unicode')),
  String: () => P.regexp(/'[^']*'/).thru(streamline('string')).map(value => {
    const stringLiteral = value.value;
    value.value = stringLiteral.slice(1, stringLiteral.length - 1);
    return value;
  }),
  NumberList: (r) => makeList(r.Number),
  Number: () => P.regexp(/[0-9]+(\.[0-9]+)?/).map(Number).thru(streamline('number')),
  Binary: () => P.regexp(/0x[A-F0-9]*/).thru(streamline('binary')),
  Science: () => P.regexp(/[+-]+[0-9]+(\.[0-9E]+)?/).thru(streamline('science')),

  Identifier: (r) => P.alt(r.RegularIdentifier, r.DelimitedIdentifier).skip(wss),
  DelimitedIdentifier: (r) => P.alt(r.DQDelimitedIdentifier, r.BracketDelimitedIdentifier).skip(wss),

  RegularIdentifier: () => P.regexp(/^[\w@#][\w@#$]*/).skip(wss),
  DQDelimitedIdentifier: () => P.regexp(/"[^"]*"/).skip(wss),
  BracketDelimitedIdentifier: () => P.regexp(/\[[^\]]*\]/).skip(wss),

  Function: (r) => P.seq(r.pIdentifier, makeList(r.pFunctionParam)),
  FunctionParam: (r) => P.alt(r.pNumber, r.pIdentifier),

  // SQL SERVER do not support boolean literal

  KeywordPKOrUnique: () => P.alt(
    BP.KeywordPrimaryKey.result({ type: 'pk', value: true }),
    BP.KeywordUnique.result({ type: 'unique', value: true }),
  ).skip(wss),
  KeywordClusteredOrNon: () => P.alt(BP.KeywordClustered, BP.KeywordNonclustered).skip(wss),
});
module.exports = Lang;
