const P = require('parsimmon');
const BP = require('../base_parsers');
const CP = require('../composite_parsers');
const { makeNode } = require('../utils');

const Lang = P.createLanguage({
  ColumnIndex: (r) => P.seqMap(
    BP.pKeywordIndex,
    CP.pIdentifier,
    CP.pKeywordClusteredOrNon.fallback(null),
    // eslint-disable-next-line no-unused-vars
    (_keyword, columnName, _clustered) => {
      return {
        type: 'index',
        value: {
          type: 'btree',
          columns: [
            {
              name: columnName,
              type: 'column',
            },
          ],
        },
      };
    },
  ).thru(makeNode()).skip(r.USIndexOptions),

  USIndexOptions: (r) => P.alt(r.WithIndexOption, r.ColumnIndexFilestream, r.OnIndexOption).many(),

  WithIndexOption: () => P.seq(BP.pKeywordWith, CP.pOptionList),
  OnIndexOption: () => P.seq(BP.pKeywordOn, P.alt(CP.pIdentifier, CP.pFunction)),
  ColumnIndexFilestream: () => P.seq(BP.pKeywordFilestream_On, CP.pIdentifier),
});
module.exports = {
  pColumnIndex: Lang.ColumnIndex,
  pUSIndexOptions: Lang.USIndexOptions,
};
