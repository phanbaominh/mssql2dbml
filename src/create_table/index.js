const { prettyPrint } = require('../utils.js');
const { pIdendity, pColumnIndex, pColumnConstraint } = require('./parsers');

const testIdendity = `IDENDITY(1, 2, 3, 4, 5, 6)     --abc        d
IDENDITY(2,3)/**/
`;
const testColumnIndex = 'INDEX    test WITH (PAD_INDEX = ON) FILESTREAM_ON "NULL" ON [file_group_name] ';

const testColumnConstraintPK = 'CONSTRAINT const   PRIMARY KEY CLUSTERED WITH   (PAD_INDEX = ON) FILESTREAM_ON "NULL" ON [file_group_name]';
const testColumnConstraintFK = 'FOREIGN KEY REFERENCES schema1.table1 (column1) ON DELETE NO ACTION ON UPDATE CASCADE NOT FOR REPLICATION';
const testColumnConstraintNFR = 'CHECK NOT FOR REPLICATION  ( 4 > 5 )';
const testColumnConstraintEnum = 'CHECK ([status] IN (\'abc\', \'xyz\'))';
const testColumnConstraints = [testColumnConstraintPK, testColumnConstraintFK, testColumnConstraintEnum, testColumnConstraintNFR];
prettyPrint(pIdendity, testIdendity, false);
prettyPrint(pColumnIndex, testColumnIndex, false);
prettyPrint(pColumnConstraint, testColumnConstraints, true);
