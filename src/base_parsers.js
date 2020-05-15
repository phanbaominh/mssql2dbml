const P = require('parsimmon');


const pWhiteSpace = P.regexp(/\s/);
const pInlineComment = P.seq(P.string('--'), P.regexp(/[^\n\r]*/));
const pMulLineComment = P.seq(P.string('/*'), P.regexp(/[\s\S]*(?=\*\/)/), P.string('*/'));
const pWhiteSpaces = P.alt(pWhiteSpace, pInlineComment, pMulLineComment).many();
const wss = pWhiteSpaces;

exports.wss = wss;

const word = function (string) {
  return P.string(string).skip(wss);
};

const keyword = function (regex) {
  return P.regexp(regex).skip(wss);
};

exports.pKeywordIdendity = keyword(/IDENDITY/i);
exports.pKeywordIndex = keyword(/INDEX/i);
exports.pKeywordWith = keyword(/WITH/i);
exports.pKeywordOn = keyword(/ON/i);
exports.pKeywordOff = keyword(/OFF/i);
exports.pKeywordFilestream_On = keyword(/FILESTREAM_ON/i);

exports.pLParen = word('(');
exports.pComma = word(',');
exports.pRParen = word(')');
exports.pDoubleQuote = word('"');
exports.pLBracket = word('[');
exports.pRBracket = word(']');
exports.pEqual = word('=');
