const P = require('parsimmon');
const B = require('../base_parsers');

const { pNumberList, pOptionList, pIdentifier } = require('../type_parsers');
const { makeNode } = require('../utils');

const pIdendity = P.seq(B.pKeywordIdendity, pNumberList.fallback(null)).thru(makeNode('idendity')).many();

const pColumnIndexWith = P.seq(B.pKeywordWith, pOptionList);
const pColumnIndexOn = P.seq(B.pKeywordOn, pIdentifier);
const pColumnIndexFilestream = P.seq(B.pKeywordFilestream_On, pIdentifier);
const pUSColumnIndex = P.alt(pColumnIndexWith, pColumnIndexFilestream, pColumnIndexOn).many();
const pColumnIndex = P.seq(B.pKeywordIndex, pIdentifier).thru(makeNode('column_index')).skip(pUSColumnIndex);

module.exports = {
  pIdendity,
  pColumnIndex,
};
