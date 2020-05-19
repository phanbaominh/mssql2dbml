const P = require('parsimmon');
const BP = require('../base_parsers');
const { pExpression } = require('../expression');
const CP = require('../composite_parsers');
const { makeNode, makeList } = require('../utils');

const pIdendity = P.seq(BP.pKeywordIdendity, CP.pNumberList.fallback(null)).thru(makeNode('idendity')).many();

const pWithIndexOption = P.seq(BP.pKeywordWith, CP.pOptionList);
const pOnIndexOption = P.seq(BP.pKeywordOn, P.alt(CP.pIdentifier, CP.pFunction));
const pColumnIndexFilestream = P.seq(BP.pKeywordFilestream_On, CP.pIdentifier);
const pUSIndexOptions = P.alt(pWithIndexOption, pColumnIndexFilestream, pOnIndexOption).many();

const pColumnIndex = P.seq(BP.pKeywordIndex, CP.pIdentifier, CP.pKeywordClusteredOrNon.fallback(null)).thru(makeNode('column_index')).skip(pUSIndexOptions);


const pFKOnOptions = P.alt(BP.pKeywordNoAction, BP.pKeywordCascade, BP.pKeywordSetDefault, BP.pKeywordSetNull);
const pFKOnDelete = P.seq(BP.pKeywordOn, BP.pKeywordDelete, pFKOnOptions);
const pFKOnUpdate = P.seq(BP.pKeywordOn, BP.pKeywordUpdate, pFKOnOptions);
const pFKNFR = BP.pKeywordNFR;
const pFKOptions = P.alt(pFKOnDelete, pFKOnUpdate, pFKNFR).many();
const pConstraintNFR = P.seq(BP.pKeywordCheck, BP.pKeywordNFR.fallback(null), pExpression);
const pConstraintName = P.seq(BP.pKeywordConstraint, CP.pIdentifier);
const pColumnConstraintIndex = P.seq(CP.pKeywordPKOrUnique, CP.pKeywordClusteredOrNon).skip(pUSIndexOptions);
const pColumnConstraintFK = P.seq(BP.pKeywordForeignKey.fallback(null), BP.pKeywordReferences, CP.pColumnName, makeList(CP.pIdentifier).fallback(null), pFKOptions.fallback(null));
const pColumnConstraintOption = P.alt(pColumnConstraintIndex, pColumnConstraintFK, pConstraintNFR).many();
const pColumnConstraint = P.seq(pConstraintName.fallback(null), pColumnConstraintOption);

module.exports = {
  pIdendity,
  pColumnIndex,
  pColumnConstraint,
};
