const P = require('parsimmon');
const BP = require('../base_parsers');
const pExpression = require('../expression');
const {
  pIdentifier, pConst, pFunction,
} = require('../composite_parsers');
const { makeList, streamline, makeNode } = require('../utils');
const { pColumnConstraintFK, pTableConstraintFK } = require('./fk_definition');
const { pColumnConstraintIndex, pTableConstraintIndex } = require('./index_definition');

const Lang = P.createLanguage({
  TableConstraint: (r) => P.seqMap(
    r.ConstraintName.fallback(null),
    r.TableConstraintOption,
    (constraintName, option) => {
      return {
        type: option.type,
        value: {
          name: constraintName,
          ...option.value,
        },
      };
    },
  ).thru(makeNode()),

  TableConstraintOption: (r) => P.alt(
    pTableConstraintFK,
    pTableConstraintIndex,
    r.ConstraintCheck,
  ),
  ColumnConstraint: (r) => P.seq(r.ConstraintName.fallback(null), r.ColumnConstraintOption)
    .map(value => value[1]),

  ColumnConstraintOption: (r) => P.alt(
    pColumnConstraintIndex,
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
    makeList(pConst.thru(makeNode())),
    (fieldName, _ununsed, values) => {
      const valuesProp = [];
      values.forEach(value => {
        valuesProp.push({
          name: value.value,
        });
      });
      return {
        type: 'enums',
        value: {
          name: fieldName,
          values: valuesProp,
        },
      };
    },
  ).thru(makeNode()),


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

  ConstExpr: () => P.seq(
    BP.LParen.fallback(null),
    P.alt(pFunction, pConst, BP.KeywordNull),
    BP.RParen.fallback(null),
  ).map(value => value[1]),
  ConstraintName: () => P.seq(BP.KeywordConstraint, pIdentifier).map(value => value[1]),
});

module.exports = {
  pColumnConstraint: Lang.ColumnConstraint,
  pTableConstraint: Lang.TableConstraint,
};
