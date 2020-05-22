const P = require('parsimmon');
const _ = require('lodash');
const BP = require('../base_parsers');
const {
  pDotDelimitedName, pIdentifier, pNumberList, pOptionList,
} = require('../composite_parsers');
const { makeNode, makeList } = require('../utils');
const { pColumnIndex } = require('./index_definition');
const { pColumnConstraint } = require('./constraint_definition');
const pExpression = require('../expression');

const Lang = P.createLanguage({
  ColumnsDefinition: (r) => P.alt(
    r.ComputedColumnDefinition.result(null),
    r.ColumnSetDefinition.result(null),
    r.ColumnDefinition,
  ),

  ColumnDefinition: (r) => P.seqMap(
    pDotDelimitedName,
    r.DataType,
    P.alt(r.ColumnSetting, r.USColumnSetting.result(null)).many().fallback(null),
    (fieldName, dataType, fieldSettings) => {
      const value = {};
      value[dataType.type] = dataType.value;
      fieldSettings.forEach(setting => {
        if (setting) value[setting.type] = setting.value;
      });
      value.name = fieldName[0];
      return {
        type: 'fields',
        value,
      };
    },
  ).thru(makeNode()),

  ColumnSetDefinition: () => P.seq(
    pIdentifier,
    BP.KeywordColumnSet,
  ),
  ComputedColumnDefinition: () => P.seq(
    pIdentifier,
    BP.KeywordAs,
    pExpression,
    P.seq(BP.KeywordPersisted, BP.KeywordNotNull.fallback(null)).fallback(null),
    pColumnConstraint.fallback(null),
  ),
  ColumnSetting: (r) => P.alt(
    r.NullOrNot,
    r.Identity,
    pColumnIndex,
    pColumnConstraint,
  ),

  USColumnSetting: (r) => P.alt(
    r.ColumnSetting1Word,
    r.ColumnSettingWith,
    r.ColumnSettingGAAR,
    r.ColumnSettingCollate,
  ),

  DataType: (r) => P.seqMap(
    pDotDelimitedName,
    makeList(P.alt(r.DataTypeXML, pIdentifier)).fallback(null),
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
  ),
  DataTypeXML: () => P.seq(P.alt(BP.KeywordDocument, BP.KeywordContent), pIdentifier)
    .map(value => value.join(' ')),


  NullOrNot: () => P.alt(BP.KeywordNull.result(false), BP.KeywordNotNull.result(true))
    .map(value => {
      return {
        type: 'not_null',
        value,
      };
    }),
  Identity: () => P.seq(BP.KeywordIdentity, pNumberList.fallback(null))
  // eslint-disable-next-line no-unused-vars
    .map(_value => {
      return {
        type: 'increment',
        value: true,
      };
    }),

  ColumnSetting1Word: () => P.alt(
    BP.KeywordFilestream,
    BP.KeywordNFR,
    BP.KeywordRowGUIDCol,
    BP.KeywordSparse,
  ),
  ColumnSettingWith: () => P.seq(P.alt(BP.KeywordMasked, BP.KeywordEncrypted), BP.KeywordWith, pOptionList),
  ColumnSettingCollate: () => P.seq(BP.KeywordCollate, pIdentifier),
  ColumnSettingGAAR: () => P.seq(
    BP.KeywordGeneratedAAR,
    P.alt(BP.KeywordStart, BP.KeywordEnd),
    BP.KeywordHidden.fallback(null),
  ),


});
module.exports = {
  pIdentity: Lang.Identity,
  pColumnIndex,
  pColumnConstraint,
  pDataType: Lang.DataType,
  pColumnsDefinition: Lang.ColumnsDefinition,
};
