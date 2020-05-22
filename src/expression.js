const P = require('parsimmon');
const _ = require('lodash');
const {
  pFunction, pDotDelimitedName, pConst,
} = require('./composite_parsers');
const {
  LParen, RParen,
} = require('./base_parsers');
const wss = require('./whitespaces');
const { streamline } = require('./utils');

function tokenize (parser) {
  return parser.many().map(value => value.join('')).fallback(null).thru(streamline('token'));
}
function enclose (parser) {
  const ManyRParen = RParen.thru(tokenize);
  const ManyLParen = LParen.thru(tokenize);
  return P.seq(ManyLParen, parser, ManyRParen);// ()skip(LParen, parser, RParen.fallback(null));
}

function enclosedOrNot (parser) {
  return P.alt(enclose(parser), parser);
}
const Lang = P.createLanguage({
  ExpressionFinal: (r) => r.Expression.map(values => {
    const flattened = _.flattenDeep(values);
    return flattened.map(value => {
      return value ? value.value : '';
    }).join('');
  }),

  Expression: (r) => {
    return enclosedOrNot(
      P.seq(
        P.alt(r.UnaryExpression, r.SimpleExpression),
        r.BinaryExpressionLR.fallback(null),
      ).skip(wss),
    );
  },
  UnaryExpression: (r) => {
    const pUnaryOp = P.regex(/[+\-~]/).thru(streamline('unary_operator'));
    const pUnaryExp = P.seq(pUnaryOp, r.Expression).skip(wss);
    return enclosedOrNot(pUnaryExp);
  },
  BinaryExpressionLR: (r) => {
    const pBinaryOp = P.regexp(/[+\-*/%=!<>&^|]{1,2}/).thru(streamline('binary_operator')).skip(wss);
    const pBinaryExp = P.seq(pBinaryOp, r.Expression).skip(wss);
    return pBinaryExp;
  },
  SimpleExpression: () => {
    const pExp = P.alt(pConst, pDotDelimitedName, pFunction).skip(wss);
    return enclosedOrNot(pExp);
  },
});

// const pExpression = regularIdentifierWithKeywordCheck(keywords);
// prettyPrint(lExpression.ExpressionFinal, '(1 + 2 + ((3) * 4) - (5/-(-3)))', true);
module.exports = Lang.ExpressionFinal;
