const P = require('parsimmon');
const BP = require('./base_parsers');
const S = require('./statements_definition');
const wss = require('./whitespaces');

const Lang = P.createLanguage({
  Statements: (r) => wss.then(r.Seperator)
    .then(P.sepBy(r.StatementTypes, r.Seperator))
    .skip(r.Seperator),
  StatementTypes: () => P.alt(
    S.pCreateIndex,
    S.pCreateTable,
    S.pAlterTable,
  ),
  Seperator: () => P.alt(BP.Semicolon, BP.KeywordGo, P.seq(BP.Semicolon, BP.KeywordGo)).many(),
});

module.exports = Lang.Statements;
