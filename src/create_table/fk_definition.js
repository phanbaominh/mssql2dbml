const P = require('parsimmon');
const BP = require('../base_parsers');
const CP = require('../composite_parsers');
const { makeList } = require('../utils');

const Lang = P.createLanguage({
  ColumnConstraintFK: (r) => P.seqMap(
    r.FKKeywords,
    CP.DotDelimitedName,
    makeList(CP.Identifier).fallback(null),
    r.FKOptions.fallback(null),
    (_unused, tableName, columnName, fkOptions) => {
      const value = {};
      value.endpoint = {
        tableName: tableName[tableName.length - 1],
        fieldNames: [columnName],
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
};
