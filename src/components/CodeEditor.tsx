import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'python',
  height = '300px',
  readOnly = false,
  className = '',
}: CodeEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<unknown>(null);

  const handleEditorDidMount = (editor: unknown, monaco: unknown) => {
    editorRef.current = editor;
    
    // Configure Python language settings
    if (language === 'python' && monaco && typeof monaco === 'object' && 'languages' in monaco) {
      const monacoTyped = monaco as { languages: { setMonarchTokensProvider: (language: string, provider: unknown) => void } };
      monacoTyped.languages.setMonarchTokensProvider('python', {
        tokenizer: {
          root: [
            // Keywords
            [/\b(def|class|if|else|elif|while|for|in|try|except|finally|with|as|import|from|return|yield|pass|break|continue|and|or|not|is|lambda|global|nonlocal|True|False|None)\b/, 'keyword'],
            
            // Built-in functions
            [/\b(print|len|range|enumerate|zip|map|filter|sum|max|min|sorted|reversed|any|all|isinstance|type|str|int|float|bool|list|dict|set|tuple)\b/, 'keyword.control'],
            
            // Strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string_double'],
            [/'/, 'string', '@string_single'],
            
            // Numbers
            [/\b\d*\.\d+([eE][\-+]?\d+)?\b/, 'number.float'],
            [/\b0[xX][0-9a-fA-F]+\b/, 'number.hex'],
            [/\b\d+\b/, 'number'],
            
            // Comments
            [/#.*$/, 'comment'],
            
            // Operators
            [/[+\-*/%=<>!&|^~]/, 'operator'],
            
            // Delimiters
            [/[{}()\[\]]/, 'delimiter'],
            [/[,;.]/, 'delimiter'],
          ],
          
          string_double: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, 'string', '@pop'],
          ],
          
          string_single: [
            [/[^\\']+/, 'string'],
            [/\\./, 'string.escape'],
            [/'/, 'string', '@pop'],
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
        language={language}
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
          tabSize: 4,
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