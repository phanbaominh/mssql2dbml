const P = require('parsimmon');


const pWhiteSpace = P.regexp(/\s/);
const pInlineComment = P.seq(P.string('--'), P.regexp(/[^\n\r]*/));
const pMulLineComment = P.seq(P.string('/*'), P.regexp(/[\s\S]*(?=\*\/)/), P.string('*/'));
const pWhiteSpaces = P.alt(pWhiteSpace, pInlineComment, pMulLineComment).many();
const wss = pWhiteSpaces;
const keywords = [];
exports.wss = wss;

const word = function (string) {
  return P.string(string).skip(wss);
};

const keyword = function (regex) {
  keywords.push(regex);
  return P.regexp(regex).skip(wss);
};

exports.keywords = keywords;

exports.pKeywordIdendity = keyword(/IDENDITY/i);
exports.pKeywordIndex = keyword(/INDEX/i);
exports.pKeywordWith = keyword(/WITH/i);
exports.pKeywordOn = keyword(/ON/i);
exports.pKeywordOff = keyword(/OFF/i);
exports.pKeywordFilestream_On = keyword(/FILESTREAM_ON/i);
exports.pKeywordPrimaryKey = keyword(/PRIMARY KEY/i);
exports.pKeywordClustered = keyword(/CLUSTERED/i);
exports.pKeywordNonclustered = keyword(/NONCLUSTERED/i);
exports.pKeywordReferences = keyword(/REFERENCES/i);
exports.pKeywordForeignKey = keyword(/FOREIGN KEY/i);
exports.pKeywordCheck = keyword(/CHECK/i);
exports.pKeywordConstraint = keyword(/CONSTRAINT/i);
exports.pKeywordUnique = keyword(/UNIQUE/i);
exports.pKeywordHash = keyword(/HASH/i);
exports.pKeywordBucket_Count = keyword(/BUCKET_COUNT/i);
exports.pKeywordNFR = keyword(/NOT[^\S\r\n]+FOR[^\S\r\n]+REPLICATION/);
exports.pKeywordDelete = keyword(/DELETE/i);
exports.pKeywordUpdate = keyword(/UPDATE/i);
exports.pKeywordSetNull = keyword(/SET[^\S\r\n]NULL/i);
exports.pKeywordSetDefault = keyword(/SET[^\S\r\n]DEFAULT/i);
exports.pKeywordNoAction = keyword(/NO[^\S\r\n]ACTION/i);
exports.pKeywordCascade = keyword(/CASCADE/i);

exports.pLessThan = word('<');
exports.pGreaterThan = word('>');
exports.pLParen = word('(');
exports.pComma = word(',');
exports.pRParen = word(')');
exports.pDoubleQuote = word('"');
exports.pLBracket = word('[');
exports.pRBracket = word(']');
exports.pEqual = word('=');
