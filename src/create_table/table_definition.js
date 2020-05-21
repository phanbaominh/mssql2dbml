const P = require('parsimmon');
const BP = require('../base_parsers');
const {
  pIdentifier, pDotDelimitedName, pFunction, pOptionList, pColumnNames, pKeywordPKOrUnique,
} = require('../composite_parsers');
const { makeNode, makeList } = require('../utils');
const { pTableConstraint } = require('./constraint_definition');
const { pTableIndex, pUSIndexOptions } = require('./index_definition');
const { pColumnDefinition } = require('./column_definition');

function getLinesValue (lines) {
  const value = {
    fields: [],
    enums: [],
    refs: [],
    indexes: [],
  };
  lines.forEach(line => {
    value[line.type].push(line.value);
  });
  return {
    type: 'lines',
    value,
  };
}
const Lang = P.createLanguage({

  CreateTable: (r) => P.seqMap(
    r.CreateTableKeywords,
    pDotDelimitedName,
    r.AsFileTableKeywords.fallback(null),
    makeList(r.Line),
    (_keyword, tableName, _keyword2, lines) => {
      const linesValue = getLinesValue(lines);
      return {
        type: 'table',
        value: {
          name: tableName[tableName.length - 1],
          ...linesValue.value,
          schemaName: tableName.length > 1 ? tableName[tableName.length - 2] : null,
        },
      };
    },
  ).thru(makeNode()).skip(r.USTableOptions),

  CreateTableKeywords: () => P.seq(BP.KeywordCreate, BP.KeywordTable),
  AsFileTableKeywords: () => P.seq(BP.KeywordAs, BP.KeywordFileTable),
  Line: (r) => P.alt(
    pColumnDefinition,
    pTableConstraint,
    pTableIndex,
    r.SystemTimeTableOption,
  ),
  SystemTimeTableOption: () => P.seq(BP.KeywordPeriodForST, makeList(pIdentifier)).result(null),
  USTableOptions: (r) => P.alt(pUSIndexOptions, r.TextImageTableOption),
  TextImageTableOption: () => P.seq(BP.KeywordTextImage_On, pIdentifier),
});

module.exports = {
  pCreateTable: Lang.CreateTable,
};
