const { prettyPrint } = require('./utils.js');
const {
  pIdentity, pColumnIndex, pColumnConstraint, pDataType, pColumnsDefinition,
} = require('./column_definition');

const { pCreateTable, pTableConstraint } = require('./create_table');
const { CreateIndex } = require('./create_index');
const { AlterTable } = require('./alter_table');

const testIdentity = 'IDENTITY(1, 2, 3, 4, 5, 6)     --abc        d';
const testColumnIndex = 'INDEX    test';

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

const testTableConstraint = 'CONSTRAINT composite FOREIGN KEY (id, user_id) REFERENCES cool (cool_id, cool_user_id) ON UPDATE NO ACTION';
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

const testTable3 = `CREATE TABLE [orders] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [user_id] int UNIQUE NOT NULL,
  [status] nvarchar(255),
  [created_at] varchar(255),
  [cool] as foo * bar,
  [abc] XML COLUMN_SET FOR ALL_SPARSE_COLUMNS,
  CONSTRAINT composite FOREIGN KEY (id, user_id) REFERENCES cool (cool_id, cool_user_id) ON UPDATE NO ACTION,
  PRIMARY KEY CLUSTERED (id, user_id),
  INDEX index1 UNIQUE (created_at, status)
) 
`;
const testCreateTable = [testTable1, testTable2, testTable3];

const testCreateIndex = `
CREATE UNIQUE CLUSTERED INDEX index1 ON table1 (column1 ASC, column2)
 INCLUDE (col, col2)
 WHERE col1 > 'col2'
 WITH (PAD_INDEX = ON, FILLFACTOR = true)
 ON COOL
 FILESTREAM_ON "NULL"
`.replace(/\n/g, '');

const testAlterTable1 = `ALTER TABLE table1
ADD CONSTRAINT cool
FOREIGN KEY (column1, column2) REFERENCES table2 (column3, column4) ON DELETE NO ACTION
`.replace(/\n/g, ' ');

const testAlterTable2 = `ALTER TABLE table1
ADD CONSTRAINT cool
PRIMARY KEY (column1)
`.replace(/\n/g, ' ');

const testAlterTable = [testAlterTable1, testAlterTable2];

prettyPrint(pIdentity, testIdentity, false);
prettyPrint(pColumnIndex, testColumnIndex, false);
prettyPrint(pColumnConstraint, testColumnConstraints, false);
prettyPrint(pDataType, testDataType, false);
prettyPrint(pColumnsDefinition, testColumnDefinition, false);
prettyPrint(pTableConstraint, testTableConstraint, false);
prettyPrint(pCreateTable, testCreateTable, false);
prettyPrint(CreateIndex, testCreateIndex, false);
prettyPrint(AlterTable, testAlterTable, true);
