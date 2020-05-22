const _ = require('lodash');

function createRefFromInlineRef (linesRefs, inlineRef, fieldName, tableName) {
  if (!inlineRef) return;
  const newRef = {};
  newRef.onUpdate = inlineRef.onUpdate;
  newRef.onDelete = inlineRef.onDelete;

  newRef.endpoints = [];
  newRef.endpoints.push(inlineRef.endpoint);
  newRef.endpoints.push({
    tableName,
    fieldName: [fieldName],
    relation: '*',
  });
  linesRefs.push(newRef);
}

function pushOutEnum (linesEnums, fieldValue) {
  if (fieldValue.enums) {
    linesEnums.push(fieldValue.enums);
    fieldValue.enums = null;
  }
}

function pushOutIndex (linesIndexes, fieldValue) {
  if (fieldValue.indexes) {
    fieldValue.indexes.columns.push({
      value: fieldValue.name,
      type: 'column',
    });
    linesIndexes.push(fieldValue.indexes);
    fieldValue.indexes = null;
  }
}
function getLinesValue (lines, tableName) {
  const value = {
    fields: [],
    enums: [],
    refs: [],
    indexes: [],
  };
  lines.forEach(line => {
    if (line) {
      if (line.type === 'fields') {
        pushOutEnum(value.enums, line.value);
        pushOutIndex(value.indexes, line.value);
        createRefFromInlineRef(value.refs, line.value.inline_ref, tableName);
      }
      value[line.type].push(line.value);
    }
  });
  return {
    type: 'lines',
    value,
  };
}

function makeTable (_keyword, tableName, _keyword2, lines) {
  const linesValue = getLinesValue(lines, _.last(tableName));
  return {
    type: 'table',
    value: {
      name: _.last(tableName),
      ...linesValue.value,
      schemaName: tableName.length > 1 ? tableName[tableName.length - 2] : null,
    },
  };
}

module.exports = {
  makeTable,
};
