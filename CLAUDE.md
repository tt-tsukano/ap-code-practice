# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 + TypeScript project for creating browser-based Python and SQL execution environments. The project integrates Pyodide for running Python code and sql.js for SQL queries directly in the browser.

## Key Technologies

- **Next.js 14** (Pages Router - App Router is prohibited)
- **TypeScript** (strict mode enabled)
- **Tailwind CSS + Shadcn/ui** for styling
- **Pyodide** for browser-based Python execution (planned)
- **sql.js** for browser-based SQL execution (planned)
- **Monaco Editor** for code editing (planned)
- **Vercel** for deployment

## Development Commands

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

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run type-check
```

## Project Architecture

### Current Structure
```
/
├── pages/                 # Next.js Pages Router
│   ├── _app.tsx          # App wrapper with ThemeProvider
│   ├── _document.tsx     # HTML document configuration
│   ├── index.tsx         # Landing page with demo navigation
│   └── demo/             # Demo pages (placeholder content)
│       ├── python.tsx    # Python execution demo
│       ├── sql.tsx       # SQL execution demo
│       └── combined.tsx  # Combined demo
├── components/
│   ├── ui/               # Shadcn/ui components
│   ├── layout.tsx        # Main layout with header and theme toggle
│   ├── theme-provider.tsx # Next-themes provider
│   └── theme-toggle.tsx  # Dark/light mode toggle
├── lib/
│   └── utils.ts          # Tailwind utility functions
└── styles/
    └── globals.css       # Global styles and Tailwind imports
```

### Future Implementation Structure
Based on the project specifications (依頼書.md), the following components will be implemented:

```
components/
├── PyodideRunner.tsx      # Python code execution component
├── CodeEditor.tsx         # Monaco Editor wrapper
├── ExecutionResult.tsx    # Result display component
├── SqlRunner.tsx          # SQL execution component
├── SqlEditor.tsx          # SQL editor component
├── ResultTable.tsx        # SQL result table
└── SchemaBuilder.tsx      # Database schema builder

lib/
├── pyodide-loader.ts      # Pyodide initialization
├── code-executor.ts       # Python code execution logic
├── sql-loader.ts          # sql.js initialization
└── query-executor.ts      # SQL query execution logic
```

## Next.js Configuration

### WASM Support
The project is configured for WebAssembly support:
- `asyncWebAssembly: true` in webpack config
- CORS headers for Pyodide/sql.js WASM loading:
  - `Cross-Origin-Embedder-Policy: require-corp`
  - `Cross-Origin-Opener-Policy: same-origin`

### Deployment
- Vercel deployment ready with `vercel.json` configuration
- Appropriate CORS headers for production

## Key Implementation Requirements

### Security & Performance Constraints
- **Execution time limits**: Python code execution must timeout after 30 seconds
- **Memory management**: Prevent memory leaks from WASM modules
- **XSS protection**: Sanitize all user input and execution results

### TypeScript Interfaces
Key interfaces for execution results (to be implemented):
```typescript
interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

interface QueryResult {
  success: boolean;
  data: any[][];
  columns: string[];
  error?: string;
  executionTime: number;
}

interface SchemaDefinition {
  tableName: string;
  createStatement: string;
  insertStatements: string[];
}
```

### Browser Compatibility
- Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- Mobile browser support (iOS Safari, Chrome Mobile)
- WASM support required for Pyodide and sql.js

### Performance Targets
- Initial page load: <3 seconds
- Pyodide initialization: <5 seconds
- sql.js initialization: <1 second
- Bundle size: <500KB (excluding WASM files)

## Theme System

The project uses `next-themes` for dark mode support:
- System preference detection
- Manual theme switching via toggle button
- Tailwind CSS dark mode classes

## Development Notes

- **Pages Router Only**: Do not use App Router (explicitly prohibited)
- **Strict TypeScript**: All code must pass strict type checking
- **Responsive Design**: All components must work on mobile devices
- **Dark Mode**: Full dark mode support required
- **Error Handling**: Comprehensive error handling for WASM initialization failures, timeouts, and execution errors