const { prettyPrint } = require('../utils.js');
const {
  pIdendity, pColumnIndex, pColumnConstraint, pDataType, pColumnDefinition
} = require('./column_definition');

const testIdendity = 'IDENDITY(1, 2, 3, 4, 5, 6)     --abc        d';
const testColumnIndex = 'INDEX    test WITH (PAD_INDEX = ON) FILESTREAM_ON "NULL" ON [file_group_name] ';

const testColumnConstraintPK = 'CONSTRAINT const   PRIMARY KEY CLUSTERED WITH   (PAD_INDEX = ON) FILESTREAM_ON "NULL" ON [file_group_name]';
const testColumnConstraintFK = 'FOREIGN KEY REFERENCES schema1.table1 (column1) ON DELETE NO ACTION ON UPDATE CASCADE NOT FOR REPLICATION';
const testColumnConstraintNFR = 'CHECK NOT FOR REPLICATION  ( 4 > 5 )';
const testColumnConstraintEnum = 'CHECK ([status] IN (\'abc\', \'xyz\'))';
const testColumnConstraintDefault = 'DEFAULT \'king\'';
const testColumnConstraints = [testColumnConstraintPK, testColumnConstraintFK, testColumnConstraintEnum,
  testColumnConstraintNFR, testColumnConstraintDefault];

const testDataType = ['varchar(500)', 'int(1,2)', 'varchar(CONTENT xml)'];

const testColumnDefinition = 'field1 varchar(500) FILESTREAM IDENDITY(1,1) NOT NULL DEFAULT \'field\'  CHECK ([field] IN (\'field\')) PRIMARY KEY COLLATE collater';
prettyPrint(pIdendity, testIdendity, false);
prettyPrint(pColumnIndex, testColumnIndex, false);
prettyPrint(pColumnConstraint, testColumnConstraints, false);
prettyPrint(pDataType, testDataType, false);
prettyPrint(pColumnDefinition, testColumnDefinition, true);
