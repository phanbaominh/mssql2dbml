const P = require('parsimmon');
const _ = require('lodash');
const BP = require('../base_parsers');
const {
  pIdentifier, pDotDelimitedName,
} = require('../composite_parsers');
const { makeNode, makeList } = require('../utils');
const { pTableConstraint } = require('./constraint_definition');
const { pTableIndex, pUSIndexOptions } = require('./index_definition');
const { pColumnDefinition } = require('./column_definition');

function pushOut (lineValue, fieldValue, tableName) {
  if (fieldValue.indexes) {
    fieldValue.indexes.columns.push({
      value: fieldValue.name,
      type: 'column',
    });
    lineValue.indexes.push(fieldValue.indexes);
    fieldValue.indexes = null;
  }
  if (fieldValue.enums) {
    lineValue.enums.push(fieldValue.enums);
    fieldValue.enums = null;
  }

  if (fieldValue.inline_ref) {
    const newRef = {};
    const oldRef = fieldValue.inline_ref[0];

    newRef.onUpdate = oldRef.onUpdate;
    newRef.onDelete = oldRef.onDelete;

    newRef.endpoints = [];
    newRef.endpoints.push(oldRef.endpoint);
    newRef.endpoints.push({
      tableName,
      fieldName: [fieldValue.name],
      relation: '*',
    });
    lineValue.refs.push(newRef);
  }
}
function getLinesValue (lines, tableName) {
  const value = {
    fields: [],
    enums: [],
    refs: [],
    indexes: [],
  };
  lines.forEach(line => {
    if (line.type === 'fields') pushOut(value, line.value, tableName);
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
      const linesValue = getLinesValue(lines, _.last(tableName));
      return {
        type: 'table',
        value: {
          name: _.last(tableName),
          ...linesValue.value,
          schemaName: tableName.length > 1 ? tableName[tableName.length - 2] : null,
        },
      };
    },
  ).thru(makeNode()).skip(r.USTableOptions),

  CreateTableKeywords: () => P.seq(BP.KeywordCreate, BP.KeywordTable),
  AsFileTableKeywords: () => P.seq(BP.KeywordAs, BP.KeywordFileTable),
  Line: (r) => P.alt(
    r.SystemTimeTableOption,
    pTableConstraint,
    pTableIndex,
    pColumnDefinition,
  ),
  SystemTimeTableOption: () => P.seq(BP.KeywordPeriodForST, makeList(pIdentifier)).result(null),
  USTableOptions: (r) => P.alt(pUSIndexOptions, r.TextImageTableOption),
  TextImageTableOption: () => P.seq(BP.KeywordTextImage_On, pIdentifier),
});

module.exports = {
  pCreateTable: Lang.CreateTable,
  pTableConstraint,
};
