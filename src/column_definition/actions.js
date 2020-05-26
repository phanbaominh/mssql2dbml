const _ = require('lodash');

function makeDataType (typeName, args) {
  return {
    type: 'type',
    value: {
      type_name: _.last(typeName),
      schemaName: typeName.length > 1 ? typeName[0] : null,
      args: args ? args.join(', ') : null,
    },
  };
}

function makeColumn (fieldName, dataType, fieldSettings) {
  const value = {};
  value[dataType.type] = dataType.value;
  fieldSettings.forEach(setting => {
    if (setting) value[setting.type] = setting.value;
  });
  value.name = fieldName[0];
  if (!value.inline_refs) value.inline_refs = [];
  return {
    type: 'fields',
    value,
  };
}

module.exports = {
  makeColumn,
  makeDataType,
};
