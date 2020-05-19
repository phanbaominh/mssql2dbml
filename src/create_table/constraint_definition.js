const P = require('parsimmon');
const BP = require('../base_parsers');
const { pExpression } = require('../expression');
const CP = require('../composite_parsers');
const { makeList, streamline } = require('../utils');
const { pFKOptions, pFKKeywords } = require('./fk_definition');
const { pUSIndexOptions } = require('./index_definition');

const pConstraintCheckEnum = P.seqMap(
  CP.pIdentifier,
  BP.pLogicalOpIn,
  makeList(CP.pConst),
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
);

const pConstraintCheckExpr = P.seq(BP.pLParen,
  P.alt(pConstraintCheckEnum, pExpression.thru(streamline('expression'))),
  BP.pRParen.fallback(null)).map(value => value[1]);

const pConstraintCheck = P.seq(
  BP.pKeywordCheck,
  BP.pKeywordNFR.fallback(null),
  pConstraintCheckExpr,
).map(value => value[2]);

const pColumnConstraintIndex = P.seqMap(
  CP.pKeywordPKOrUnique,
  CP.pKeywordClusteredOrNon.fallback(null),
  (keyword) => {
    return keyword;
  },
).skip(pUSIndexOptions);

const pColumnConstraintFK = P.seqMap(
  pFKKeywords,
  CP.pDotDelimitedName,
  makeList(CP.pIdentifier).fallback(null),
  pFKOptions.fallback(null),
  (_unused, tableName, columnName, fkOptions) => {
    const value = {};
    value.endpoint = {
      tableName: tableName[tableName.length - 1],
      fieldName: columnName,
      relation: '*',
    };

    fkOptions.forEach(option => {
      if (option.type.match(/ON[^\S\r\n]DELETE/i)) {
        value.onDelete = option.setting;
      }
      if (option.type.match(/ON[^\S\r\n]UPDATE/i)) {
        value.onUpdate = option.setting;
      }
    });

    return {
      type: 'inline_ref',
      value: [value],
    };
  },
);

const pConstExpr = P.alt(CP.pConst, BP.pKeywordNull, CP.pFunction);
const pConstraintDefault = P.seqMap(
  BP.pKeywordDefault,
  pConstExpr,
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
);
const pConstraintName = P.seq(BP.pKeywordConstraint, CP.pIdentifier);
const pColumnConstraintOption = P.alt(
  pColumnConstraintIndex,
  pColumnConstraintFK,
  pConstraintCheck,
  pConstraintDefault,
);

const pColumnConstraint = P.seq(pConstraintName.fallback(null), pColumnConstraintOption)
  .map(value => value[1]);

module.exports = {
  pColumnConstraint,
};
