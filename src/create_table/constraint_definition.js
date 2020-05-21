const P = require('parsimmon');
const BP = require('../base_parsers');
const { pExpression } = require('../expression');
const {
  pIdentifier, pKeywordPKOrUnique, pKeywordClusteredOrNon, pConst, pFunction,
} = require('../composite_parsers');
const { makeList, streamline } = require('../utils');
const { pColumnConstraintFK } = require('./fk_definition');
const { pUSIndexOptions } = require('./index_definition');

const Lang = P.createLanguage({
  ColumnConstraint: (r) => P.seq(r.ConstraintName.fallback(null), r.ColumnConstraintOption)
    .map(value => value[1]),

  ColumnConstraintOption: (r) => P.alt(
    r.ColumnConstraintIndex,
    pColumnConstraintFK,
    r.ConstraintCheck,
    r.ConstraintDefault,
  ),

  ConstraintCheck: (r) => P.seq(
    BP.KeywordCheck,
    BP.KeywordNFR.fallback(null),
    r.ConstraintCheckExpr,
  ).map(value => value[2]),


  ConstraintCheckExpr: (r) => P.seq(BP.LParen,
    P.alt(r.ConstraintCheckEnum, pExpression.thru(streamline('expression'))),
    BP.RParen.fallback(null)).map(value => value[1]),

  ConstraintCheckEnum: () => P.seqMap(
    pIdentifier,
    BP.LogicalOpIn,
    makeList(pConst),
    (fieldName, _ununsed, values) => {
      const valuesProp = [];
      values.forEach(value => {
        valuesProp.push({
          name: value.value,
        });
      });
      return {
        type: 'enum',
        value: {
          name: fieldName,
          values: valuesProp,
        },
      };
    },
  ),

  ColumnConstraintIndex: () => P.seqMap(
    pKeywordPKOrUnique,
    pKeywordClusteredOrNon.fallback(null),
    (keyword) => {
      return keyword;
    },
  ).skip(pUSIndexOptions),

  ConstraintDefault: (r) => P.seqMap(
    BP.KeywordDefault,
    r.ConstExpr,
    (_keyword, constExpression) => {
      const value = {};
      if (constExpression.type) {
        switch (constExpression.type) {
          case 'string':
          case 'number':
            value.type = constExpression.type;
            break;

          default:
            value.type = 'expression';
            break;
        }
      } else {
        value.type = 'expression';
      }
      value.value = constExpression.value;

      return {
        type: 'dbdefault',
        value,
      };
    },
  ),

  ConstExpr: () => P.alt(pConst, BP.KeywordNull, pFunction),
  ConstraintName: () => P.seq(BP.KeywordConstraint, pIdentifier),
});

module.exports = {
  pColumnConstraint: Lang.ColumnConstraint,
};
