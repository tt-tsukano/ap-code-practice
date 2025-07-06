import React, { useState, useMemo } from 'react';
import { QueryResult } from '@/lib/query-executor';
import { Button } from './ui/button';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';

interface ResultTableProps {
  result: QueryResult | null;
  className?: string;
}

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export function ResultTable({ result, className = '' }: ResultTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterText, setFilterText] = useState('');

  const sortedAndFilteredData = useMemo(() => {
    if (!result || !result.data) return [];

    let processedData = [...result.data];

    // Apply filtering
    if (filterText) {
      processedData = processedData.filter(row =>
        row.some(cell => 
          cell !== null && cell !== undefined && 
          cell.toString().toLowerCase().includes(filterText.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig) {
      const columnIndex = result.columns.indexOf(sortConfig.column);
      if (columnIndex !== -1) {
        processedData.sort((a, b) => {
          const aValue = a[columnIndex];
          const bValue = b[columnIndex];
          
          // Handle null/undefined values
          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;
          
          // Compare values
          let comparison = 0;
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else {
            comparison = aValue.toString().localeCompare(bValue.toString());
          }
          
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
      }
    }

    return processedData;
  }, [result, sortConfig, filterText]);

  const handleSort = (column: string) => {
    if (!sortConfig || sortConfig.column !== column) {
      setSortConfig({ column, direction: 'asc' });
    } else if (sortConfig.direction === 'asc') {
      setSortConfig({ column, direction: 'desc' });
    } else {
      setSortConfig(null);
    }
  };

  const exportToCsv = () => {
    if (!result || !result.data.length) return;

    const csvContent = [
      result.columns.join(','),
      ...result.data.map(row => 
        row.map(cell => {
          if (cell === null || cell === undefined) return '';
          const stringValue = cell.toString();
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'query_results.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (!result) {
    return (
      <div className={`bg-muted/50 border rounded-md p-4 ${className}`}>
        <p className="text-sm text-muted-foreground">クエリ結果がここに表示されます</p>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className={`border rounded-md bg-red-50 dark:bg-red-900/20 ${className}`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              クエリ実行エラー
            </span>
          </div>
          <pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
            {result.error}
          </pre>
        </div>
      </div>
    );
  }

  if (!result.data || result.data.length === 0) {
    return (
      <div className={`border rounded-md ${className}`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">クエリ実行成功</span>
            <span className="text-xs text-muted-foreground ml-auto">
              実行時間: {result.executionTime}ms
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {result.columns.length > 0 
              ? 'クエリは正常に実行されましたが、結果が空です。'
              : 'クエリが正常に実行されました。'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">
              {result.data.length} 件の結果
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            実行時間: {result.executionTime}ms
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="結果を検索..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button
            onClick={exportToCsv}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              {result.columns.map((column, index) => (
                <th
                  key={index}
                  className="px-3 py-2 text-left font-medium border-b cursor-pointer hover:bg-muted/75 select-none"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column}</span>
                    {sortConfig?.column === column && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-muted/25">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 border-r last:border-r-0">
                    {cell === null || cell === undefined ? (
                      <span className="text-muted-foreground italic">NULL</span>
                    ) : (
                      <span className="font-mono text-xs">{cell.toString()}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filterText && (
        <div className="p-2 border-t bg-muted/25">
          <p className="text-xs text-muted-foreground">
            {result.data.length} 件中 {sortedAndFilteredData.length} 件を表示
          </p>
        </div>
      )}
    </div>
  );
}