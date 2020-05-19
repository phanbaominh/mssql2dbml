const P = require('parsimmon');
const _ = require('lodash');
const BP = require('../base_parsers');
const CP = require('../composite_parsers');
const { makeNode, makeList } = require('../utils');
const { pColumnIndex } = require('./index_definition');
const { pColumnConstraint } = require('./constraint_definition');

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

const pColumnSetting1Word = P.alt(
  BP.pKeywordFilestream,
  BP.pKeywordNFR,
  BP.pKeywordRowGUIDCol,
  BP.pKeywordSparse,
);
const pColumnSettingWith = P.seq(P.alt(BP.pKeywordMasked, BP.pKeywordEncrypted), BP.pKeywordWith, CP.pOptionList);
const pColumnSettingCollate = P.seq(BP.pKeywordCollate, CP.pIdentifier);
const pColumnSettingGAAR = P.seq(
  BP.pKeywordGeneratedAAR,
  P.alt(BP.pKeywordStart, BP.pKeywordEnd),
  BP.pKeywordHidden.fallback(null),
);

const pUSColumnSetting = P.alt(
  pColumnSetting1Word,
  pColumnSettingWith,
  pColumnSettingGAAR,
  pColumnSettingCollate,
).many();

const pColumnDefinition = P.seqMap(
  CP.pDotDelimitedName,
  pDataType.skip(pUSColumnSetting),
  P.alt(pNullOrNot, pIdendity, pColumnIndex, pColumnConstraint).many(),
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
).skip(pUSColumnSetting).thru(makeNode());

module.exports = {
  pIdendity,
  pColumnIndex,
  pColumnConstraint,
  pDataType,
  pColumnDefinition,
};
