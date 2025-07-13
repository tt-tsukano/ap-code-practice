import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import Layout from './components/layout'

// Pages
import HomePage from './pages/index'
import PythonDemo from './pages/demo/python'
import SqlDemo from './pages/demo/sql'
import CombinedDemo from './pages/demo/combined'
import ProblemsDemo from './pages/demo/problems'
import ConverterDemo from './pages/demo/converter'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo/python" element={<PythonDemo />} />
          <Route path="/demo/sql" element={<SqlDemo />} />
          <Route path="/demo/combined" element={<CombinedDemo />} />
          <Route path="/demo/problems" element={<ProblemsDemo />} />
          <Route path="/demo/converter" element={<ConverterDemo />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default App