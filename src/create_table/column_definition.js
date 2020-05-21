const P = require('parsimmon');
const _ = require('lodash');
const BP = require('../base_parsers');
const CP = require('../composite_parsers');
const { makeNode, makeList } = require('../utils');
const { pColumnIndex } = require('./index_definition');
const { pColumnConstraint } = require('./constraint_definition');

const Lang = P.createLanguage({
  ColumnDefinition: (r) => P.seqMap(
    CP.pDotDelimitedName,
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
    CP.pDotDelimitedName,
    makeList(P.alt(r.DataTypeXML, CP.pIdentifier)),
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
  DataTypeXML: () => P.seq(P.alt(BP.pKeywordDocument, BP.pKeywordContent), CP.pIdentifier)
    .map(value => value.join(' ')),


  NullOrNot: () => P.alt(BP.pKeywordNull.result(false), BP.pKeywordNotNull.result(true))
    .map(value => {
      return {
        type: 'not_null',
        value,
      };
    }),
  Idendity: () => P.seq(BP.pKeywordIdendity, CP.pNumberList.fallback(null))
  // eslint-disable-next-line no-unused-vars
    .map(_value => {
      return {
        type: 'increment',
        value: true,
      };
    }),

  ColumnSetting1Word: () => P.alt(
    BP.pKeywordFilestream,
    BP.pKeywordNFR,
    BP.pKeywordRowGUIDCol,
    BP.pKeywordSparse,
  ),
  ColumnSettingWith: () => P.seq(P.alt(BP.pKeywordMasked, BP.pKeywordEncrypted), BP.pKeywordWith, CP.pOptionList),
  ColumnSettingCollate: () => P.seq(BP.pKeywordCollate, CP.pIdentifier),
  ColumnSettingGAAR: () => P.seq(
    BP.pKeywordGeneratedAAR,
    P.alt(BP.pKeywordStart, BP.pKeywordEnd),
    BP.pKeywordHidden.fallback(null),
  ),


});
module.exports = {
  pIdendity: Lang.Idendity,
  pColumnIndex,
  pColumnConstraint,
  pDataType: Lang.DataType,
  pColumnDefinition: Lang.ColumnDefinition,
};
