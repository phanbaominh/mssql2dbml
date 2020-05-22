const P = require('parsimmon');
const BP = require('../base_parsers');
const {
  pIdentifier, pDotDelimitedName,
} = require('../composite_parsers');
const { makeNode, makeList } = require('../utils');
const A = require('./actions');
const { pTableConstraintFK } = require('../fk_definition');
const { pTableConstraintIndex } = require('../index_definition');
const { pConstraintCheck, pConstExpr, pConstraintName } = require('../constraint_definition');

const Lang = P.createLanguage({

  AlterTable: (r) => P.seqMap(
    r.AlterTableKeywords,
    pDotDelimitedName,
    r.AlterTableActions,
    A.handleAlterTableResult,
  ),
  AlterTableActions: (r) => P.alt(r.AddAction),
  AlterTableKeywords: () => P.seq(BP.KeywordAlter, BP.KeywordTable),

  AddAction: (r) => P.seq(BP.KeywordAdd, r.AddOption).map(value => value[1]),
  AddOption: (r) => P.alt(r.AddConstraint),
  AddConstraint: (r) => P.seqMap(
    pConstraintName,
    r.AddConstraintOption,
    A.makeTableConstraint,
  ).thru(makeNode()),
  AddConstraintOption: (r) => P.alt(pTableConstraintFK, r.USAddConstraintOption),

  USAddConstraintOption: (r) => P.alt(
    pTableConstraintIndex,
    pConstraintCheck,
    r.AddConstraintDefault,
    r.AddConstraintConnection,
  ),

  AddConstraintDefault: () => P.seq(
    BP.KeywordDefault,
    pConstExpr,
    BP.KeywordFor,
    pIdentifier,
    BP.KeywordWithValues.fallback(null),
  ),

  AddConstraintConnection: () => P.seq(
    BP.KeywordConnection,
    makeList(P.seq(pIdentifier, BP.KeywordTo, pIdentifier)),
  ),
});
module.exports = Lang;
