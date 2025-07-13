# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vite + React + TypeScript project implementing a browser-based Python and SQL execution environment for educational purposes, specifically designed for practicing Japanese Applied Information Technology Engineer exam problems. The project integrates Pyodide for running Python code and sql.js for SQL queries directly in the browser.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run type-check

# Clean cache and build artifacts
npm run clean

# Check if port 3000 is available
npm run check-port

# Kill Node processes (debugging)
npm run kill-processes
```

## Key Technologies & Architecture

- **Vite** (Fast build tool and dev server)
- **React 18** with React Router for routing
- **TypeScript** (strict mode enabled) 
- **Tailwind CSS + Shadcn/ui** for styling
- **Pyodide** for browser-based Python execution
- **sql.js** for browser-based SQL execution  
- **Monaco Editor** for code editing
- **Vercel** for deployment

## Core Architecture Components

### Problem Management System
- **`types/problem.ts`**: Comprehensive TypeScript interfaces for algorithm and database problems
- **`lib/problem-loader.ts`**: Problem data loading with caching and validation
- **`lib/problem-utils.ts`**: Problem analysis and utility functions
- **`data/problems/`**: JSON problem data files organized by category

### Code Execution System
- **`lib/pyodide-loader.ts`**: Pyodide initialization and script loading
- **`lib/code-executor.ts`**: Python code execution with timeout and error handling
- **`lib/sql-loader.ts`**: sql.js initialization
- **`lib/query-executor.ts`**: SQL query execution
- **`lib/error-monitoring.ts`**: Performance monitoring and error tracking

### UI Components
- **`components/PyodideRunner.tsx`**: Python code execution interface
- **`components/SqlRunner.tsx`**: SQL execution interface
- **`components/CodeEditor.tsx`**: Monaco Editor wrapper
- **`components/ExecutionResult.tsx`**: Result display
- **`components/ResultTable.tsx`**: SQL result visualization
- **`components/SchemaBuilder.tsx`**: Database schema management

## Critical Configuration

### Vite Configuration
- **HMR**: Hot Module Replacement enabled for fast development
- **Code Splitting**: Automatic chunk splitting for optimal loading
- **WASM Support**: Configured for Pyodide and sql.js
- **Path Resolution**: @ alias points to src/ directory
- **Build Optimization**: Target ES2020 with modern features

### CORS Headers for WASM
Required for Pyodide and sql.js:
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

## Problem Data Structure

### Algorithm Problems (`r4s-q8.json`)
- Pseudocode with fill-in-the-blank sections
- Multiple choice options with explanations
- Test cases for validation
- Structured with `AlgorithmProblem` interface

### Database Problems (`r4s-q3.json`)
- Database schema definitions
- SQL query templates with blanks
- Expected result sets
- Structured with `DatabaseProblem` interface

## Key Implementation Patterns

### Execution Flow
1. **Initialization**: Pyodide/sql.js loaded asynchronously via CDN
2. **Code Execution**: 30-second timeout with custom stdout/stderr capture
3. **Error Handling**: Comprehensive error monitoring and user feedback
4. **Result Display**: Formatted output with execution time metrics

### Performance Optimization
- **Problem Caching**: 5-minute TTL for loaded problems
- **Lazy Loading**: WASM modules loaded on demand
- **Request Idle Callback**: Non-blocking script loading
- **Static Generation**: Problems pre-loaded at build time

### Type Safety
- Strict TypeScript configuration
- Runtime validation with `validateProblemData()`
- Type guards for problem categories (`isAlgorithmProblem`, `isDatabaseProblem`)
- Comprehensive interfaces in `types/problem.ts`

## Development Notes

- **React Router**: Client-side routing with React Router DOM
- **Fast Development**: Vite provides instant HMR and fast builds
- **WASM Dependencies**: Pyodide and sql.js loaded from CDN
- **Error Monitoring**: Built-in performance and error tracking
- **Mobile Support**: Responsive design for all screen sizes
- **Dark Mode**: Full theme switching with next-themes

## Debugging & Troubleshooting

### Build Issues
If experiencing build problems:
1. Run `npm run clean` to clear caches
2. Check TypeScript errors with `npm run type-check`
3. Verify all imports use correct paths (@ alias points to src/)

### WASM Loading Issues
- Verify CORS headers in `vercel.json`
- Check browser console for security policy errors
- Ensure CDN URLs are accessible

### Problem Data Issues
- Use `src/pages/demo/problems.tsx` to validate problem data
- Check JSON syntax and schema compliance
- Verify problem IDs match file naming convention

### Dynamic Import Warnings
- Vite may show warnings for dynamic imports in problem-loader.ts
- These warnings are expected and don't affect functionality
- Add `/* @vite-ignore */` comment if needed to suppress warnings