const P = require('parsimmon');
const _ = require('lodash');
const {
  pNumber, pFunction, pDelimitedIdentifier,
} = require('./type_parsers');
const {
  wss, pLParen, pRParen, keywords,
} = require('./base_parsers');
const { prettyPrint } = require('./utils');

function regularIdentifierWithKeywordCheck (_keywords) {
  return P((input, i) => {
    const slicedInputs = {};
    const isMatched = _keywords.some(keyword => {
      const keywordLength = keyword.toString().length - 5;
      if (!slicedInputs[keywordLength]) slicedInputs[keywordLength] = input.slice(i, i + keywordLength);
      return slicedInputs[keywordLength].match(keyword);
    });

    const slicedInput = input.slice(i);
    if (isMatched) {
      console.log(slicedInput + slicedInput.length);
      return P.makeFailure(i, 'matched keyword');
    }

    const result = slicedInput.match(/^[\w@#][\w@#$]*/);
    if (result) {
      return P.makeSuccess(i + result[0].length, result[0]);
    }

    return P.makeFailure(i, 'not identifier');
  });
}
const pRegularIdentifer = regularIdentifierWithKeywordCheck(keywords);
const pIdentifier = P.alt(pRegularIdentifer, pDelimitedIdentifier).skip(wss);
const pDotDelimitedName = P.sepBy1(pIdentifier, P.string('.')).skip(wss);

const pString = P.regexp(/^'[^']*'$/).skip(wss);
const pUnicode = P.seq(P.string('N'), pString).skip(wss);
const pBinary = P.regexp(/0x[A-F0-9]*/).skip(wss);
const pScience = P.regexp(/[+-]+[0-9]+(\.[0-9E]+)?/).skip(wss);
const pMoney = P.seq(P.regexp(/[+-]$/), pNumber).skip(wss);
const pSigned = P.seq(P.regexp(/[+-]/), pNumber).skip(wss);
const pConst = P.alt(pString, pUnicode, pBinary, pScience, pMoney, pSigned, pNumber);

function enclose (parser) {
  return P.seq(pLParen, parser, pRParen.fallback(null));
}

function enclosedOrNot (parser) {
  return P.alt(enclose(parser), parser);
}
const lExpression = P.createLanguage({
  Expression: (r) => {
    return P.alt(r.BinaryExpression, r.UnaryExpression, r.SimpleExpression)
      .skip(wss);//.map(value => _.flattenDeep(value).join('')).notFollowedBy(P.string('IN'));
  },
  UnaryExpression: (r) => {
    const pUnaryOp = P.regex(/[+\-~]/);
    const pUnaryExp = P.seq(pUnaryOp, r.Expression).skip(wss);
    return enclosedOrNot(pUnaryExp);
  },
  BinaryExpression: (r) => {
    const pBinaryOp = P.regexp(/[+\-*/%=!<>&^)(|]+/).skip(wss);
    const pBinaryExp = P.seq(r.SimpleExpression, pBinaryOp, r.Expression).skip(wss);
    return enclosedOrNot(pBinaryExp);
  },
  SimpleExpression: () => {
    const pExp = P.alt(pConst, pDotDelimitedName, pFunction, pRParen).skip(wss);
    return enclosedOrNot(pExp);
  },
});

// const pExpression = regularIdentifierWithKeywordCheck(keywords);
prettyPrint(lExpression.Expression, '1 + 2 + (3 * 4) * (2 * (5 * 6)) CHECK', true);
