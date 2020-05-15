const { prettyPrint } = require('../utils.js');
const { pIdendity, pColumnIndex } = require('./parsers');

const testIdendity = `IDENDITY(1, 2, 3, 4, 5, 6)     --abc        d
IDENDITY(2,3)/**/
`;
const testColumnIndex = 'INDEX    test WITH (PAD_INDEX = ON) FILESTREAM_ON "NULL" ON [file_group_name] ';
prettyPrint(pIdendity.tryParse(testIdendity), false);
prettyPrint(pColumnIndex.tryParse(testColumnIndex), true);
