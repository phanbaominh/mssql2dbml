const P = require('parsimmon');
const BP = require('../base_parsers');
const CP = require('../composite_parsers');
const { makeList } = require('../utils');

const Lang = P.createLanguage({
  ColumnConstraintFK: (r) => P.seqMap(
    r.FKKeywords,
    CP.pDotDelimitedName,
    makeList(CP.pIdentifier).fallback(null),
    r.FKOptions.fallback(null),
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
  ),
  FKOptions: (r) => P.alt(r.FKOnDelete, r.FKOnUpdate, r.FKNFR).many(),
  FKKeywords: () => P.seq(BP.pKeywordForeignKey.fallback(null), BP.pKeywordReferences),

  FKOnDelete: (r) => P.seqObj(
    ['type', BP.pKeywordOnDelete],
    ['setting', r.FKOnOptions],
  ),
  FKOnUpdate: (r) => P.seqObj(
    ['type', BP.pKeywordOnUpdate],
    ['setting', r.FKOnOptions],
  ),
  FKNFR: () => BP.pKeywordNFR.map(value => {
    return { type: value };
  }),
  FKOnOptions: () => P.alt(BP.pKeywordNoAction, BP.pKeywordCascade, BP.pKeywordSetDefault, BP.pKeywordSetNull),


});
module.exports = {
  pColumnConstraintFK: Lang.ColumnConstraintFK,
};
