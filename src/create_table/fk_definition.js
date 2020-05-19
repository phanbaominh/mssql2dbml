const P = require('parsimmon');
const BP = require('../base_parsers');

const pFKKeywords = P.seq(BP.pKeywordForeignKey.fallback(null), BP.pKeywordReferences);
const pFKOnOptions = P.alt(BP.pKeywordNoAction, BP.pKeywordCascade, BP.pKeywordSetDefault, BP.pKeywordSetNull);
const pFKOnDelete = P.seqObj(
  ['type', BP.pKeywordOnDelete],
  ['setting', pFKOnOptions],
);
const pFKOnUpdate = P.seqObj(
  ['type', BP.pKeywordOnUpdate],
  ['setting', pFKOnOptions],
);
const pFKNFR = BP.pKeywordNFR.map(value => {
  return { type: value };
});
const pFKOptions = P.alt(pFKOnDelete, pFKOnUpdate, pFKNFR).many();

module.exports = {
  pFKKeywords,
  pFKOptions,
};
