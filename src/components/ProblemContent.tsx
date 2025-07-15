import React from 'react';
import { AlgorithmProblem, DatabaseProblem } from '../types/problem';

interface ProblemContentProps {
  problem: AlgorithmProblem | DatabaseProblem;
  currentStep: 'reading' | 'solving' | 'validation' | 'completed';
}

export const ProblemContent: React.FC<ProblemContentProps> = ({
  problem,
  currentStep
}) => {
  // 問題設定・背景の表示
  const renderSituation = () => {
    const content = problem.category === 'algorithm' 
      ? (problem as AlgorithmProblem).situation 
      : (problem as DatabaseProblem).scenario;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">問題設定</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    );
  };

  // データベーススキーマの表示
  const renderDatabaseSchema = () => {
    if (problem.category !== 'database') return null;

    const dbProblem = problem as DatabaseProblem;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">データベーススキーマ</h3>
        <div className="space-y-4">
          {dbProblem.schema.map((table, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {table.tableName}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {table.description}
              </p>
              
              {/* テーブル構造 */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">カラム名</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">型</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">NULL</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">説明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((column, colIndex) => (
                      <tr key={colIndex} className="hover:bg-gray-50">
                        <td className="px-3 py-2 border-b font-mono text-sm">
                          {column.name}
                          {table.primaryKey.includes(column.name) && (
                            <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">PK</span>
                          )}
                        </td>
                        <td className="px-3 py-2 border-b font-mono text-sm text-blue-600">
                          {column.type}
                        </td>
                        <td className="px-3 py-2 border-b text-sm">
                          {column.nullable ? 'Yes' : 'No'}
                        </td>
                        <td className="px-3 py-2 border-b text-sm text-gray-600">
                          {column.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 外部キー制約 */}
              {table.foreignKeys.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">外部キー制約</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {table.foreignKeys.map((fk, fkIndex) => (
                      <li key={fkIndex} className="flex items-center">
                        <span className="font-mono bg-gray-100 px-1 rounded">
                          {fk.column}
                        </span>
                        <span className="mx-2">→</span>
                        <span className="font-mono bg-gray-100 px-1 rounded">
                          {fk.referencedTable}.{fk.referencedColumn}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* サンプルデータ */}
              {table.sampleData.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">サンプルデータ</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300 rounded text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          {table.columns.map((column, colIndex) => (
                            <th key={colIndex} className="px-2 py-1 text-left font-medium text-gray-700 border-b">
                              {column.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.sampleData.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-2 py-1 border-b font-mono">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {table.sampleData.length > 5 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ...他 {table.sampleData.length - 5} 行
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 解説・復習内容の表示
  const renderExplanation = () => {
    if (currentStep !== 'completed') return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">解説・復習</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {problem.explanation}
          </p>
        </div>

        {/* 関連する学習項目 */}
        {problem.relatedTopics.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">関連する学習項目</h4>
            <div className="flex flex-wrap gap-2">
              {problem.relatedTopics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* 問題文 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {problem.title}
        </h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {problem.description}
          </p>
        </div>
      </div>

      {/* 問題設定・背景 */}
      {renderSituation()}

      {/* データベーススキーマ（データベース問題の場合のみ） */}
      {renderDatabaseSchema()}

      {/* 解説・復習（完了時のみ） */}
      {renderExplanation()}
    </div>
  );
};

export default ProblemContent;