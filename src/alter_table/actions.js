const _ = require('lodash');
const { makeTableConstraint } = require('../constraint_definition');

function handleAlterTableResult (_keyword, tableName, result) {
  if (!result) return null;
  switch (result.type) {
    case 'refs':
      // eslint-disable-next-line no-case-declarations
      const endpointWithNoTableName = result.value.endpoints.find(ele => !ele.tableName);
      endpointWithNoTableName.tableName = _.last(tableName);
      break;

    default:
      break;
  }
  return result;
}

module.exports = {
  makeTableConstraint,
  handleAlterTableResult,
};
