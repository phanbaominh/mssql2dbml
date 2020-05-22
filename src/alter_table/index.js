const P = require('parsimmon');
const BP = require('../base_parsers');
const {
  pDotDelimitedName,
} = require('../composite_parsers');
const A = require('./actions');
const pAddAction = require('./add');

const Lang = P.createLanguage({

  AlterTable: (r) => P.seqMap(
    r.AlterTableKeywords,
    pDotDelimitedName,
    r.AlterTableActions,
    A.handleAlterTableResult,
  ),
  AlterTableActions: () => P.alt(pAddAction),
  AlterTableKeywords: () => P.seq(BP.KeywordAlter, BP.KeywordTable),
});
module.exports = Lang;
