import React, { useState } from 'react';
import { SchemaDefinition } from '@/lib/query-executor';
import { Button } from './ui/button';
import { Plus, Trash2, Database, Table, FileText } from 'lucide-react';

interface SchemaBuilderProps {
  schemas: SchemaDefinition[];
  onSchemasChange: (schemas: SchemaDefinition[]) => void;
  onInitializeSchema: () => void;
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_SCHEMA: SchemaDefinition = {
  tableName: 'students',
  createStatement: `CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    score INTEGER
);`,
  insertStatements: [
    `INSERT INTO students VALUES (1, '田中太郎', 85);`,
    `INSERT INTO students VALUES (2, '佐藤花子', 92);`,
    `INSERT INTO students VALUES (3, '鈴木一郎', 78);`,
  ],
};

export function SchemaBuilder({
  schemas,
  onSchemasChange,
  onInitializeSchema,
  isLoading = false,
  className = '',
}: SchemaBuilderProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  // const [showAddSchema, setShowAddSchema] = useState(false);

  const addSchema = () => {
    const newSchema: SchemaDefinition = {
      tableName: `table_${schemas.length + 1}`,
      createStatement: `CREATE TABLE table_${schemas.length + 1} (
    id INTEGER PRIMARY KEY,
    column1 TEXT
);`,
      insertStatements: [`INSERT INTO table_${schemas.length + 1} VALUES (1, 'value1');`],
    };
    onSchemasChange([...schemas, newSchema]);
    setActiveTab(schemas.length);
  };

  const removeSchema = (index: number) => {
    const newSchemas = schemas.filter((_, i) => i !== index);
    onSchemasChange(newSchemas);
    if (activeTab >= newSchemas.length) {
      setActiveTab(Math.max(0, newSchemas.length - 1));
    }
  };

  const updateSchema = (index: number, updatedSchema: SchemaDefinition) => {
    const newSchemas = [...schemas];
    newSchemas[index] = updatedSchema;
    onSchemasChange(newSchemas);
  };

  const addInsertStatement = (schemaIndex: number) => {
    const schema = schemas[schemaIndex];
    const newInsertStatement = `INSERT INTO ${schema.tableName} VALUES ();`;
    updateSchema(schemaIndex, {
      ...schema,
      insertStatements: [...schema.insertStatements, newInsertStatement],
    });
  };

  const removeInsertStatement = (schemaIndex: number, insertIndex: number) => {
    const schema = schemas[schemaIndex];
    const newInsertStatements = schema.insertStatements.filter((_, i) => i !== insertIndex);
    updateSchema(schemaIndex, {
      ...schema,
      insertStatements: newInsertStatements,
    });
  };

  const loadDefaultSchema = () => {
    onSchemasChange([DEFAULT_SCHEMA]);
    setActiveTab(0);
  };

  // Initialize with default schema if empty
  if (schemas.length === 0) {
    return (
      <div className={`border rounded-md p-4 ${className}`}>
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <Database className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold">データベーススキーマ</h3>
            <p className="text-sm text-muted-foreground">
              SQLクエリを実行するためのテーブルを作成してください
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={loadDefaultSchema} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              サンプルスキーマを読み込み
            </Button>
            <Button onClick={addSchema} variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新しいテーブルを作成
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span className="text-sm font-medium">データベーススキーマ ({schemas.length} テーブル)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={addSchema}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            テーブル追加
          </Button>
          <Button
            onClick={onInitializeSchema}
            disabled={isLoading}
            size="sm"
            className="flex items-center gap-1"
          >
            <Database className="h-3 w-3" />
            スキーマ初期化
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b bg-muted/25 overflow-x-auto">
        {schemas.map((schema, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === index
                ? 'border-primary text-primary'
                : 'border-transparent hover:border-muted-foreground/50'
            }`}
          >
            <Table className="h-3 w-3" />
            {schema.tableName}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSchema(index);
              }}
              className="ml-1 p-1 hover:bg-muted rounded"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </button>
        ))}
      </div>

      {/* Schema Editor */}
      {schemas[activeTab] && (
        <div className="p-4 space-y-4">
          {/* Table Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">テーブル名</label>
            <input
              type="text"
              value={schemas[activeTab].tableName}
              onChange={(e) =>
                updateSchema(activeTab, {
                  ...schemas[activeTab],
                  tableName: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* CREATE Statement */}
          <div>
            <label className="text-sm font-medium mb-2 block">CREATE TABLE文</label>
            <textarea
              value={schemas[activeTab].createStatement}
              onChange={(e) =>
                updateSchema(activeTab, {
                  ...schemas[activeTab],
                  createStatement: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
              rows={6}
            />
          </div>

          {/* INSERT Statements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">INSERT文</label>
              <Button
                onClick={() => addInsertStatement(activeTab)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                INSERT文追加
              </Button>
            </div>
            <div className="space-y-2">
              {schemas[activeTab].insertStatements.map((statement, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={statement}
                    onChange={(e) => {
                      const newStatements = [...schemas[activeTab].insertStatements];
                      newStatements[index] = e.target.value;
                      updateSchema(activeTab, {
                        ...schemas[activeTab],
                        insertStatements: newStatements,
                      });
                    }}
                    className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                    rows={2}
                  />
                  <Button
                    onClick={() => removeInsertStatement(activeTab, index)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}