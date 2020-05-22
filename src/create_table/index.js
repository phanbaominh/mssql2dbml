const P = require('parsimmon');
const BP = require('../base_parsers');
const {
  pIdentifier, pDotDelimitedName,
} = require('../composite_parsers');
const { makeNode, makeList } = require('../utils');
const { pTableConstraint } = require('../constraint_definition');
const { pTableIndex, pUSIndexOption } = require('../index_definition');
const { pColumnsDefinition } = require('../column_definition');
const A = require('./actions');

const Lang = P.createLanguage({

  CreateTable: (r) => P.seqMap(
    r.CreateTableKeywords,
    pDotDelimitedName,
    r.AsFileTableKeywords.fallback(null),
    makeList(r.Line),
    A.makeTable,
  ).thru(makeNode()).skip(r.USTableOptions),

  CreateTableKeywords: () => P.seq(BP.KeywordCreate, BP.KeywordTable),
  AsFileTableKeywords: () => P.seq(BP.KeywordAs, BP.KeywordFileTable),
  Line: (r) => P.alt(
    r.SystemTimeTableOption,
    pTableConstraint,
    pTableIndex,
    pColumnsDefinition,
  ),
  SystemTimeTableOption: () => P.seq(BP.KeywordPeriodForST, makeList(pIdentifier)).result(null),
  USTableOptions: (r) => P.alt(pUSIndexOption, r.TextImageTableOption).many(),
  TextImageTableOption: () => P.seq(BP.KeywordTextImage_On, pIdentifier),
});

module.exports = {
  pCreateTable: Lang.CreateTable,
  pTableConstraint,
};
