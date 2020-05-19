const P = require('parsimmon');
const _ = require('lodash');
const BP = require('../base_parsers');
const { pExpression } = require('../expression');
const CP = require('../composite_parsers');
const { makeNode, makeList } = require('../utils');

const pNullOrNot = P.alt(BP.pKeywordNull.result(false), BP.pKeywordNotNull.result(true))
  .map(value => {
    return {
      type: 'not_null',
      value,
    };
  });
const pIdendity = P.seq(BP.pKeywordIdendity, CP.pNumberList.fallback(null))
  // eslint-disable-next-line no-unused-vars
  .map(_value => {
    return {
      type: 'increment',
      value: true,
    };
  });

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

const pConstraintCheckEnum = P.seqMap(
  CP.pIdentifier,
  BP.pLogicalOpIn,
  makeList(CP.pConst),
  (fieldName, _ununsed, values) => {
    const valuesProp = [];
    values.forEach(value => {
      valuesProp.push({
        name: value,
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
  P.alt(pConstraintCheckEnum, pExpression
    .map(value => {
      return { type: 'expression', value };
    })),
  BP.pRParen.fallback(null)).map(value => value[1]);

const pConstraintCheck = P.seq(
  BP.pKeywordCheck,
  BP.pKeywordNFR.fallback(null),
  pConstraintCheckExpr,
).map(value => value[2]);

const pColumnConstraintIndex = P.seqMap(
  CP.pKeywordPKOrUnique,
  CP.pKeywordClusteredOrNon,
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

const pConstraintName = P.seq(BP.pKeywordConstraint, CP.pIdentifier);
const pColumnConstraintOption = P.alt(pColumnConstraintIndex, pColumnConstraintFK, pConstraintCheck);

const pColumnConstraint = P.seq(pConstraintName.fallback(null), pColumnConstraintOption)
  .map(value => value[1]);

const pDataTypeXML = P.seq(P.alt(BP.pKeywordDocument, BP.pKeywordContent), CP.pIdentifier).map(value => value.join(' '));
const pDataType = P.seqMap(
  CP.pDotDelimitedName,
  makeList(P.alt(pDataTypeXML, CP.pIdentifier)),
  (typeName, args) => {
    return {
      type: 'type',
      value: {
        type_name: _.last(typeName),
        schemaName: typeName.length > 1 ? typeName[0] : null,
        args: args ? args.join(', ') : null,
      },
    };
  },
);


module.exports = {
  pIdendity,
  pColumnIndex,
  pColumnConstraint,
  pDataType,
};
