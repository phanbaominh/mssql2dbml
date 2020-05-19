const { prettyPrint } = require('./utils.js');
const { pExpression } = require('./expression.js');

const text = `asjdas + dsakld
abc`;
prettyPrint(pExpression, text, true);
