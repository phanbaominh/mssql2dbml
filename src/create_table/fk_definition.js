const P = require('parsimmon');
const BP = require('../base_parsers');
const { pDotDelimitedName, pIdentifier, pColumnNames } = require('../composite_parsers');
const { makeList, makeNode } = require('../utils');
const _ = require('lodash');

function makeEndPoint (tableName, columnName, relation) {
  return {
    tableName: tableName[tableName.length - 1],
    fieldNames: columnName,
    relation,
  };
}

function setOption (value, fkOptions) {
  fkOptions.forEach(option => {
    if (option.type.match(/ON[^\S\r\n]DELETE/i)) {
      value.onDelete = option.setting;
    }
    if (option.type.match(/ON[^\S\r\n]UPDATE/i)) {
      value.onUpdate = option.setting;
    }
  });
}

const Lang = P.createLanguage({
  TableConstraintFK: (r) => P.seqMap(
    BP.KeywordForeignKey.fallback(null),
    r.TableEndpoint,
    BP.KeywordReferences,
    pDotDelimitedName,
    r.TableEndpoint,
    r.FKOptions.fallback(null),
    (_keyword1, endpoint1, _keyword2, tableName, endpoint2, fkOptions) => {
      const value = {};

      endpoint1.value.relation = '*';
      endpoint2.value.relation = '1';
      endpoint2.value.tableName = _.last(tableName);

      value.endpoints = [endpoint1.value, endpoint2.value];
      setOption(value, fkOptions);

      return {
        type: 'refs',
        value,
      };
    },
  ),

  TableEndpoint: () => P.seqMap(
    pColumnNames,
    (columnNames) => {
      return {
        type: 'endpoint',
        value: {
          fieldNames: columnNames,
        },
      };
    },
  ).thru(makeNode()),

  ColumnConstraintFK: (r) => P.seqMap(
    r.FKKeywords,
    pDotDelimitedName,
    makeList(pIdentifier).fallback(null),
    r.FKOptions.fallback(null),
    (_unused, tableName, columnName, fkOptions) => {
      const value = {};
      value.endpoint = makeEndPoint(tableName, columnName, '1');
      setOption(value, fkOptions);
      return {
        type: 'inline_ref',
        value: [value],
      };
    },
  ),
  FKOptions: (r) => P.alt(r.FKOnDelete, r.FKOnUpdate, r.FKNFR).many(),
  FKKeywords: () => P.seq(BP.KeywordForeignKey.fallback(null), BP.KeywordReferences),

  FKOnDelete: (r) => P.seqObj(
    ['type', BP.KeywordOnDelete],
    ['setting', r.FKOnOptions],
  ),
  FKOnUpdate: (r) => P.seqObj(
    ['type', BP.KeywordOnUpdate],
    ['setting', r.FKOnOptions],
  ),
  FKNFR: () => BP.KeywordNFR.map(value => {
    return { type: value };
  }),
  FKOnOptions: () => P.alt(BP.KeywordNoAction, BP.KeywordCascade, BP.KeywordSetDefault, BP.KeywordSetNull),


});
module.exports = {
  pColumnConstraintFK: Lang.ColumnConstraintFK,
  pTableConstraintFK: Lang.TableConstraintFK,
};
