import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  readOnly?: boolean;
  className?: string;
}

export function SqlEditor({
  value,
  onChange,
  height = '300px',
  readOnly = false,
  className = '',
}: SqlEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<unknown>(null);

  const handleEditorDidMount = (editor: unknown, monaco: unknown) => {
    editorRef.current = editor;
    
    // Configure SQL language settings
    if (monaco && typeof monaco === 'object' && 'languages' in monaco) {
      const monacoTyped = monaco as { languages: { setMonarchTokensProvider: (language: string, provider: unknown) => void } };
      monacoTyped.languages.setMonarchTokensProvider('sql', {
        tokenizer: {
          root: [
            // Keywords
            [/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|TABLE|DROP|ALTER|INDEX|JOIN|INNER|LEFT|RIGHT|OUTER|ON|AS|GROUP|BY|ORDER|ASC|DESC|HAVING|UNION|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|AND|OR|NOT|NULL|IS|IN|BETWEEN|LIKE|EXISTS|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|UNIQUE|DEFAULT|AUTO_INCREMENT|VARCHAR|INT|INTEGER|TEXT|BLOB|REAL|NUMERIC|DATETIME|DATE|TIME|TIMESTAMP|BOOLEAN|CHAR|DECIMAL|FLOAT|DOUBLE|TINYINT|SMALLINT|MEDIUMINT|BIGINT)\b/i, 'keyword'],
            
            // Functions
            [/\b(ABS|COALESCE|IFNULL|LENGTH|LOWER|UPPER|TRIM|LTRIM|RTRIM|SUBSTR|REPLACE|INSTR|ROUND|CEIL|FLOOR|RANDOM|DATE|TIME|DATETIME|STRFTIME|JULIANDAY|NOW|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP)\b/i, 'keyword.control'],
            
            // Strings
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/'/, 'string', '@string_single'],
            [/"/, 'string', '@string_double'],
            
            // Numbers
            [/\b\d*\.\d+([eE][\-+]?\d+)?\b/, 'number.float'],
            [/\b0[xX][0-9a-fA-F]+\b/, 'number.hex'],
            [/\b\d+\b/, 'number'],
            
            // Comments
            [/--.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],
            
            // Operators
            [/[+\-*/%=<>!&|^~]/, 'operator'],
            [/(<>|<=|>=|==|!=)/, 'operator'],
            
            // Delimiters
            [/[{}()\[\]]/, 'delimiter'],
            [/[,;.]/, 'delimiter'],
          ],
          
          string_single: [
            [/[^\\']+/, 'string'],
            [/\\./, 'string.escape'],
            [/'/, 'string', '@pop'],
          ],
          
          string_double: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, 'string', '@pop'],
          ],
          
          comment: [
            [/[^\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment'],
          ],
        },
      });
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      <Editor
        height={height}
        language="sql"
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          rulers: [80],
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          folding: true,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          contextmenu: false,
          selectOnLineNumbers: true,
          smoothScrolling: true,
          cursorStyle: 'line',
          cursorBlinking: 'blink',
          renderWhitespace: 'selection',
          renderControlCharacters: false,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            bracketPairsHorizontal: true,
            highlightActiveIndentation: true,
            indentation: true,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showClasses: true,
            showFunctions: true,
            showVariables: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          parameterHints: {
            enabled: true,
          },
          formatOnType: true,
          formatOnPaste: true,
        }}
      />
    </div>
  );
}