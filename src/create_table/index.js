const { prettyPrint } = require('../utils.js');
const {
  pIdendity, pColumnIndex, pColumnConstraint, pDataType,
} = require('./parsers');

const testIdendity = 'IDENDITY(1, 2, 3, 4, 5, 6)     --abc        d';
const testColumnIndex = 'INDEX    test WITH (PAD_INDEX = ON) FILESTREAM_ON "NULL" ON [file_group_name] ';

const testColumnConstraintPK = 'CONSTRAINT const   PRIMARY KEY CLUSTERED WITH   (PAD_INDEX = ON) FILESTREAM_ON "NULL" ON [file_group_name]';
const testColumnConstraintFK = 'FOREIGN KEY REFERENCES schema1.table1 (column1) ON DELETE NO ACTION ON UPDATE CASCADE NOT FOR REPLICATION';
const testColumnConstraintNFR = 'CHECK NOT FOR REPLICATION  ( 4 > 5 )';
const testColumnConstraintEnum = 'CHECK ([status] IN (\'abc\', \'xyz\'))';
const testColumnConstraints = [testColumnConstraintPK, testColumnConstraintFK, testColumnConstraintEnum, testColumnConstraintNFR];

const testDataType = ['varchar(500)', 'int(1,2)', 'varchar(CONTENT xml)'];
prettyPrint(pIdendity, testIdendity, true);
prettyPrint(pColumnIndex, testColumnIndex, true);
prettyPrint(pColumnConstraint, testColumnConstraints, true);
prettyPrint(pDataType, testDataType, true);
