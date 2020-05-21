const P = require('parsimmon');
const _ = require('lodash');
const BP = require('../base_parsers');
const CP = require('../composite_parsers');
const { makeNode, makeList } = require('../utils');
const { pColumnIndex } = require('./index_definition');
const { pColumnConstraint } = require('./constraint_definition');

const Lang = P.createLanguage({
  ColumnDefinition: (r) => P.seqMap(
    CP.DotDelimitedName,
    r.DataType.skip(r.USColumnSetting),
    P.alt(r.NullOrNot, r.Idendity, pColumnIndex, pColumnConstraint).many(),
    (fieldName, dataType, fieldSettings) => {
      const value = {};
      value[dataType.type] = dataType.value;
      fieldSettings.forEach(setting => {
        value[setting.type] = setting.value;
      });
      value.name = fieldName[0];
      return {
        type: 'field',
        value,
      };
    },
  ).skip(r.USColumnSetting).thru(makeNode()),

  USColumnSetting: (r) => P.alt(
    r.ColumnSetting1Word,
    r.ColumnSettingWith,
    r.ColumnSettingGAAR,
    r.ColumnSettingCollate,
  ).many(),

  DataType: (r) => P.seqMap(
    CP.DotDelimitedName,
    makeList(P.alt(r.DataTypeXML, CP.Identifier)),
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
  DataTypeXML: () => P.seq(P.alt(BP.KeywordDocument, BP.KeywordContent), CP.Identifier)
    .map(value => value.join(' ')),


  NullOrNot: () => P.alt(BP.KeywordNull.result(false), BP.KeywordNotNull.result(true))
    .map(value => {
      return {
        type: 'not_null',
        value,
      };
    }),
  Idendity: () => P.seq(BP.KeywordIdendity, CP.NumberList.fallback(null))
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
  ColumnSettingWith: () => P.seq(P.alt(BP.KeywordMasked, BP.KeywordEncrypted), BP.KeywordWith, CP.OptionList),
  ColumnSettingCollate: () => P.seq(BP.KeywordCollate, CP.Identifier),
  ColumnSettingGAAR: () => P.seq(
    BP.KeywordGeneratedAAR,
    P.alt(BP.KeywordStart, BP.KeywordEnd),
    BP.KeywordHidden.fallback(null),
  ),


});
module.exports = {
  pIdendity: Lang.Idendity,
  pColumnIndex,
  pColumnConstraint,
  pDataType: Lang.DataType,
  pColumnDefinition: Lang.ColumnDefinition,
};
