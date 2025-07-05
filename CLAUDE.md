# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 + TypeScript project for creating browser-based Python and SQL execution environments. The project integrates Pyodide for running Python code and sql.js for SQL queries directly in the browser.

## Key Technologies

- **Next.js 14** (Pages Router - App Router is prohibited)
- **TypeScript** (strict mode enabled)
- **Tailwind CSS + Shadcn/ui** for styling
- **Pyodide** for browser-based Python execution
- **sql.js** for browser-based SQL execution
- **Monaco Editor** for code editing
- **Vercel** for deployment

## Project Structure

```
/
├── pages/
│   ├── _app.tsx           # Next.js app wrapper
│   ├── _document.tsx      # Next.js document wrapper
│   ├── index.tsx          # Landing page
│   └── demo/
│       ├── python.tsx     # Python execution demo
│       ├── sql.tsx        # SQL execution demo
│       └── combined.tsx   # Combined demo
├── components/
│   ├── ui/                # Shadcn/ui components
│   ├── PyodideRunner.tsx  # Python code execution component
│   ├── CodeEditor.tsx     # Monaco Editor wrapper
│   ├── ExecutionResult.tsx # Result display component
│   ├── SqlRunner.tsx      # SQL execution component
│   ├── SqlEditor.tsx      # SQL editor component
│   ├── ResultTable.tsx    # SQL result table
│   └── SchemaBuilder.tsx  # Database schema builder
├── lib/
│   ├── utils.ts           # Utility functions
│   ├── pyodide-loader.ts  # Pyodide initialization
│   ├── code-executor.ts   # Python code execution logic
│   ├── sql-loader.ts      # sql.js initialization
│   └── query-executor.ts  # SQL query execution logic
└── styles/
    └── globals.css        # Global styles
```

## Development Commands

Since this is a new project setup, typical Next.js commands apply:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

## Key Implementation Requirements

### Security & Performance Constraints
- **Execution time limits**: Python code execution must timeout after 30 seconds
- **Memory management**: Prevent memory leaks from WASM modules
- **CORS headers**: Required for Pyodide/sql.js WASM loading
- **XSS protection**: Sanitize all user input and execution results

### Component Architecture
- **PyodideRunner**: Main component for Python execution with execution timeout
- **SqlRunner**: Main component for SQL execution with result table display
- **Monaco Editor integration**: Code editors with syntax highlighting
- **Result display**: Separate stdout/stderr for Python, tabular results for SQL

### Browser Compatibility
- Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- Mobile browser support (iOS Safari, Chrome Mobile)
- WASM support required for Pyodide and sql.js

### Performance Targets
- Initial page load: <3 seconds
- Pyodide initialization: <5 seconds
- sql.js initialization: <1 second
- Bundle size: <500KB (excluding WASM files)

## Critical Configuration

### Next.js Configuration
- WASM support via `asyncWebAssembly: true`
- CORS headers for Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy
- Vercel deployment optimization

### TypeScript Interfaces
Key interfaces for execution results:
- `ExecutionResult` for Python execution
- `QueryResult` for SQL execution
- `SchemaDefinition` for database schema

## Development Notes

- **Pages Router Only**: Do not use App Router (explicitly prohibited)
- **Strict TypeScript**: All code must pass strict type checking
- **Responsive Design**: All components must work on mobile devices
- **Dark Mode**: Full dark mode support required
- **Error Handling**: Comprehensive error handling for WASM initialization failures, timeouts, and execution errors