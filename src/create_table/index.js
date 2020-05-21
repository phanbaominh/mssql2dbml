const { prettyPrint } = require('../utils.js');
const {
  pIdentity, pColumnIndex, pColumnConstraint, pDataType, pColumnDefinition,
} = require('./column_definition');

const { pCreateTable } = require('./table_definition');

const testIdentity = 'IDENTITY(1, 2, 3, 4, 5, 6)     --abc        d';
const testColumnIndex = 'INDEX    test WITH (PAD_INDEX = ON) FILESTREAM_ON "NULL" ON [file_group_name] ';

const testColumnConstraintPK = 'CONSTRAINT const   PRIMARY KEY CLUSTERED WITH   (PAD_INDEX = ON) FILESTREAM_ON "NULL" ON [file_group_name]';
const testColumnConstraintFK = 'FOREIGN KEY REFERENCES schema1.table1 (column1) ON DELETE NO ACTION ON UPDATE CASCADE NOT FOR REPLICATION';
const testColumnConstraintNFR = 'CHECK NOT FOR REPLICATION  ( 4 > 5 )';
const testColumnConstraintEnum = 'CHECK ([status] IN (\'abc\', \'xyz\'))';
const testColumnConstraintDefault = 'DEFAULT \'king\'';
const testColumnConstraints = [testColumnConstraintPK, testColumnConstraintFK, testColumnConstraintEnum,
  testColumnConstraintNFR, testColumnConstraintDefault];

const testDataType = ['varchar(500)', 'int(1,2)', 'varchar(CONTENT xml)'];

const testColumn1 = 'field1 varchar(500) FILESTREAM IDENTITY(1,1) NOT NULL DEFAULT \'field\'  CHECK ([field] IN (\'field\')) PRIMARY KEY COLLATE collater';
const testColumn2 = '[created_at] varchar(255)';
const testColumnDefinition = [testColumn1, testColumn2];

const testTable1 = `CREATE TABLE [orders] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [user_id] int UNIQUE NOT NULL,
  [status] nvarchar(255) NOT NULL CHECK ([status] IN ('created', 'running', 'done', 'failure')),
  [created_at] varchar(255)
)`;
const testTable2 = `CREATE TABLE [users] (
  [id] int PRIMARY KEY IDENTITY(1, 1) REFERENCES orders (id),
  [name] varchar(255) INDEX cool,
  [email] varchar(255) UNIQUE,
  [date_of_birth] datetime,
  [created_at] datetime DEFAULT now(),
  [country_code] int NOT NULL
)`;

const testTable = [testTable1, testTable2];

prettyPrint(pIdentity, testIdentity, false);
prettyPrint(pColumnIndex, testColumnIndex, false);
prettyPrint(pColumnConstraint, testColumnConstraints, false);
prettyPrint(pDataType, testDataType, false);
prettyPrint(pColumnDefinition, testColumnDefinition, false);
prettyPrint(pCreateTable, testTable, true);
