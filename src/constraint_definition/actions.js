function makeDefaultConstraint (_keyword, constExpression) {
  const value = {};
  if (constExpression.type) {
    switch (constExpression.type) {
      case 'string':
      case 'number':
        value.type = constExpression.type;
        break;

      default:
        value.type = 'expression';
        break;
    }
  } else {
    value.type = 'expression';
  }
  value.value = constExpression.value;
  return {
    type: 'dbdefault',
    value,
  };
}

function makeConstraintCheckEnum (fieldName, _ununsed, values) {
  const valuesProp = [];
  values.forEach(value => {
    valuesProp.push({
      name: value.value,
    });
  });
  return {
    type: 'enums',
    value: {
      name: fieldName,
      values: valuesProp,
    },
  };
}

function makeTableConstraint (constraintName, option) {
  if (!option) return null;
  return {
    type: option.type,
    value: {
      name: constraintName,
      ...option.value,
    },
  };
}

module.exports = {
  makeConstraintCheckEnum,
  makeDefaultConstraint,
  makeTableConstraint,
};
