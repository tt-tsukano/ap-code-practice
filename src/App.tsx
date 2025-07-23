import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/theme-provider';
import Layout from './components/layout';

// 既存ページ
import HomePage from './pages/index';
import PythonDemo from './pages/demo/python';
import SqlDemo from './pages/demo/sql';
import CombinedDemo from './pages/demo/combined';
import ProblemsDemo from './pages/demo/problems';
import ConverterDemo from './pages/demo/converter';

// 新規追加ページ
import ProblemsListPage from './pages/problems/index';
import ProblemPage from './pages/problems/[id]';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
            {/* ホームページ */}
            <Route path="/" element={<HomePage />} />
            <Route path="/demo" element={<HomePage />} />
            
            {/* デモページ群 */}
            <Route path="/demo/python" element={
              <Layout>
                <PythonDemo />
              </Layout>
            } />
            <Route path="/demo/sql" element={
              <Layout>
                <SqlDemo />
              </Layout>
            } />
            <Route path="/demo/combined" element={
              <Layout>
                <CombinedDemo />
              </Layout>
            } />
            <Route path="/demo/problems" element={
              <Layout>
                <ProblemsDemo />
              </Layout>
            } />
            <Route path="/demo/converter" element={
              <Layout>
                <ConverterDemo />
              </Layout>
            } />
            
            {/* 学習ページ群 */}
            <Route path="/problems" element={<ProblemsListPage />} />
            <Route path="/problems/:id" element={<ProblemPage />} />
            
            {/* 404ページ */}
            <Route path="*" element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">404 - ページが見つかりません</h1>
                  <p className="text-gray-600 mt-2">
                    <a href="/demo" className="text-blue-600 hover:underline">
                      デモページに戻る
                    </a>
                  </p>
                </div>
              </div>
            } />
        </Routes>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;