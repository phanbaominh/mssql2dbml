const P = require('parsimmon');
const BP = require('../base_parsers');
const {
  pIdentifier, pKeywordClusteredOrNon, pFunction, pOptionList, pColumnNames, pKeywordPKOrUnique,
} = require('../composite_parsers');
const { makeNode } = require('../utils');
const A = require('./actions');

const Lang = P.createLanguage({

  TableIndex: (r) => P.seqMap(
    BP.KeywordIndex,
    pIdentifier,
    BP.KeywordUnique.fallback(null),
    pKeywordClusteredOrNon.fallback(null),
    BP.KeywordColumnStore.fallback(null),
    pColumnNames,
    A.makeTableIndex,
  ).thru(makeNode()).skip(r.USIndexOptions),

  TableConstraintIndex: (r) => P.seqMap(
    pKeywordPKOrUnique,
    pKeywordClusteredOrNon.fallback(null),
    pColumnNames,
    A.makeTableConstraintIndex,
  ).thru(makeNode()).skip(r.USIndexOptions),

  ColumnConstraintIndex: (r) => P.seq(
    pKeywordPKOrUnique,
    r.USIndexOptions,
  ).skip(r.USIndexOptions).map(value => value[0]),

  ColumnIndex: (r) => P.seqMap(
    BP.KeywordIndex,
    pIdentifier,
    A.makeColumnIndex,
  ).thru(makeNode()).skip(r.USIndexOptions),

  USIndexOptions: (r) => P.alt(pKeywordClusteredOrNon, r.USIndexOption).many(),
  USIndexOption: (r) => P.alt(r.WithIndexOption, r.ColumnIndexFilestream, r.OnIndexOption),
  WithIndexOption: () => P.seq(BP.KeywordWith, pOptionList),
  OnIndexOption: () => P.seq(BP.KeywordOn, P.alt(pIdentifier, pFunction)),
  ColumnIndexFilestream: () => P.seq(BP.KeywordFilestream_On, pIdentifier),
});
module.exports = {
  pColumnIndex: Lang.ColumnIndex,
  pUSIndexOption: Lang.USIndexOption,
  pTableIndex: Lang.TableIndex,
  pColumnConstraintIndex: Lang.ColumnConstraintIndex,
  pTableConstraintIndex: Lang.TableConstraintIndex,
};
