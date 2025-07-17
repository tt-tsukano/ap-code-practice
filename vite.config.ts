/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Path resolution for @ alias
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  // Dev server configuration
  server: {
    port: 5173,
    host: 'localhost',
    open: true,
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          editor: ['@monaco-editor/react'],
          ui: ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },

  // WASM support for Pyodide and sql.js
  optimizeDeps: {
    exclude: ['pyodide', 'sql.js'],
    include: ['react', 'react-dom', 'react-router-dom'],
  },

  // Worker support for heavy computations
  worker: {
    format: 'es',
  },

  // Environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },

  // Asset handling
  assetsInclude: ['**/*.wasm'],

  // CSS configuration
  css: {
    postcss: './postcss.config.mjs',
  },

  // Preview server (for production builds)
  preview: {
    port: 5173,
    host: 'localhost',
  },
})