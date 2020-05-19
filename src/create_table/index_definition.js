const P = require('parsimmon');
const BP = require('../base_parsers');
const CP = require('../composite_parsers');
const { makeNode } = require('../utils');

const pWithIndexOption = P.seq(BP.pKeywordWith, CP.pOptionList);
const pOnIndexOption = P.seq(BP.pKeywordOn, P.alt(CP.pIdentifier, CP.pFunction));
const pColumnIndexFilestream = P.seq(BP.pKeywordFilestream_On, CP.pIdentifier);
const pUSIndexOptions = P.alt(pWithIndexOption, pColumnIndexFilestream, pOnIndexOption).many();

const pColumnIndex = P.seqMap(
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
).thru(makeNode()).skip(pUSIndexOptions);

module.exports = {
  pColumnIndex,
  pUSIndexOptions,
};
