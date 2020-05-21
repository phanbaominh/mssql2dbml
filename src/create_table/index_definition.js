const P = require('parsimmon');
const BP = require('../base_parsers');
const {
  pIdentifier, pKeywordClusteredOrNon, pFunction, pOptionList, pColumnNames, pKeywordPKOrUnique,
} = require('../composite_parsers');
const { makeNode } = require('../utils');

function makeIndex (columnNames, isUnique, isPk, indexName = null) {
  const columns = [];

  columnNames.forEach(column => {
    columns.push({
      value: column,
      type: 'column',
    });
  });

  return {
    type: 'indexes',
    value: {
      type: 'btree',
      name: indexName,
      unique: isUnique ? true : null,
      pk: isPk ? true : null,
      columns,
    },
  };
}
const Lang = P.createLanguage({

  TableIndex: (r) => P.seqMap(
    BP.KeywordIndex,
    pIdentifier,
    BP.KeywordUnique.fallback(null),
    pKeywordClusteredOrNon.fallback(null),
    BP.KeywordColumnStore.fallback(null),
    pColumnNames,
    (_keyword, indexName, isUnique, _clustered, _columnstore, columnNames) => {
      return makeIndex(columnNames, isUnique, null, indexName);
    },
  ).thru(makeNode()).skip(r.USIndexOptions),

  TableConstraintIndex: (r) => P.seqMap(
    pKeywordPKOrUnique,
    pKeywordClusteredOrNon.fallback(null),
    pColumnNames,
    (keyword, _keyword, columnNames) => {
      let isPk = null;
      let isUnique = null;

      if (keyword.type === 'pk') {
        isPk = true;
      } else {
        isUnique = true;
      }

      return makeIndex(columnNames, isUnique, isPk);
    },
  ).thru(makeNode()).skip(r.USIndexOptions),

  ColumnConstraintIndex: (r) => P.seqMap(
    pKeywordPKOrUnique,
    pKeywordClusteredOrNon.fallback(null),
    (keyword) => {
      return keyword;
    },
  ).skip(r.USIndexOptions),

  ColumnIndex: (r) => P.seqMap(
    BP.KeywordIndex,
    pIdentifier,
    pKeywordClusteredOrNon.fallback(null),
    // eslint-disable-next-line no-unused-vars
    (_keyword, indexName, _clustered) => {
      return {
        type: 'indexes',
        value: {
          type: 'btree',
          name: indexName,
          columns: [
          ],
        },
      };
    },
  ).thru(makeNode()).skip(r.USIndexOptions),

  USIndexOptions: (r) => P.alt(r.WithIndexOption, r.ColumnIndexFilestream, r.OnIndexOption).many(),
  WithIndexOption: () => P.seq(BP.KeywordWith, pOptionList),
  OnIndexOption: () => P.seq(BP.KeywordOn, P.alt(pIdentifier, pFunction)),
  ColumnIndexFilestream: () => P.seq(BP.KeywordFilestream_On, pIdentifier),
});
module.exports = {
  pColumnIndex: Lang.ColumnIndex,
  pUSIndexOptions: Lang.USIndexOptions,
  pTableIndex: Lang.TableIndex,
  pColumnConstraintIndex: Lang.ColumnConstraintIndex,
  pTableConstraintIndex: Lang.TableConstraintIndex,
};
