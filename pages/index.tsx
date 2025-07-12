import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Globe, Cpu, Database, Code } from 'lucide-react';

interface BrowserSupport {
  name: string;
  version: string;
  supported: boolean;
  features: {
    wasm: boolean;
    workers: boolean;
    modules: boolean;
  };
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<BrowserSupport | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    pyodideLoadTime: 0,
    sqlJsLoadTime: 0,
    isLoading: true,
  });

  useEffect(() => {
    setIsMounted(true);
    
    // Browser compatibility check
    const checkBrowserSupport = () => {
      const userAgent = navigator.userAgent;
      let browserName = 'Unknown';
      let version = 'Unknown';

      if (userAgent.includes('Chrome')) {
        browserName = 'Chrome';
        const match = userAgent.match(/Chrome\/(\d+)/);
        version = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+)/);
        version = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserName = 'Safari';
        const match = userAgent.match(/Version\/(\d+)/);
        version = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Edge')) {
        browserName = 'Edge';
        const match = userAgent.match(/Edg\/(\d+)/);
        version = match ? match[1] : 'Unknown';
      }

      const features = {
        wasm: typeof WebAssembly !== 'undefined',
        workers: typeof Worker !== 'undefined',
        modules: 'noModule' in HTMLScriptElement.prototype,
      };

      const minVersions: Record<string, number> = {
        Chrome: 90,
        Firefox: 90,
        Safari: 14,
        Edge: 90,
      };

      const supported = 
        features.wasm && 
        features.workers && 
        parseInt(version) >= (minVersions[browserName] || 999);

      setBrowserInfo({
        name: browserName,
        version,
        supported,
        features,
      });
    };

    // Performance measurement simulation (disabled to prevent hydration errors)
    // const measurePerformance = async () => {
    //   setPerformanceMetrics({
    //     pyodideLoadTime: Math.floor(Math.random() * 3000) + 2000, // 2-5 seconds
    //     sqlJsLoadTime: Math.floor(Math.random() * 800) + 200, // 0.2-1 seconds
    //     isLoading: false,
    //   });
    // };

    checkBrowserSupport();
    // measurePerformance();
    
    // Set default performance metrics to avoid hydration errors
    setPerformanceMetrics({
      pyodideLoadTime: 3500, // Fixed values to prevent hydration mismatch
      sqlJsLoadTime: 600,
      isLoading: false,
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            ブラウザ内 Python・SQL 実行環境
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            PyodideとSql.jsを使用して、ブラウザ内でPythonコードとSQLクエリを実行できるデモアプリケーションです。
          </p>
          
          {/* Browser Compatibility Status */}
          {isMounted && browserInfo && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              browserInfo.supported 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              <Globe className="h-4 w-4" />
              {browserInfo.name} {browserInfo.version} - {browserInfo.supported ? '対応済み' : '非対応'}
            </div>
          )}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Code className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Python実行環境</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Pyodideを使用してブラウザ内でPythonコードを実行。フィボナッチ数列やデータ処理のデモが利用可能です。
            </p>
            <div className="flex items-center justify-between">
              <Link 
                href="/demo/python" 
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Python デモを見る
              </Link>
              {isMounted && !performanceMetrics.isLoading && (
                <span className="text-xs text-muted-foreground">
                  予想読み込み時間: {(performanceMetrics.pyodideLoadTime / 1000).toFixed(1)}秒
                </span>
              )}
            </div>
          </div>
          
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Database className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold">SQL実行環境</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Sql.jsを使用してブラウザ内でSQLクエリを実行。学生データベースのサンプルで試すことができます。
            </p>
            <div className="flex items-center justify-between">
              <Link 
                href="/demo/sql" 
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                SQL デモを見る
              </Link>
              {isMounted && !performanceMetrics.isLoading && (
                <span className="text-xs text-muted-foreground">
                  予想読み込み時間: {(performanceMetrics.sqlJsLoadTime / 1000).toFixed(1)}秒
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Combined Demo */}
        <div className="border rounded-lg p-6 mb-12 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Cpu className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold">統合デモ</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            PythonとSQLを組み合わせたデモンストレーション。両方の実行環境を同時に利用できます。
          </p>
          <Link 
            href="/demo/combined" 
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            統合デモを見る
          </Link>
        </div>
        {/* Features & Compatibility Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Technical Specifications */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">技術仕様</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Next.js 14 + TypeScript
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Pyodide 0.28.0 (Python 3.11)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                SQL.js (SQLite 3.x)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Monaco Editor
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                WebAssembly対応
              </li>
            </ul>
          </div>

          {/* Browser Support Details */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">ブラウザ対応状況</h3>
            </div>
            {isMounted && browserInfo ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>WebAssembly:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    browserInfo.features.wasm 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {browserInfo.features.wasm ? '対応' : '非対応'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Web Workers:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    browserInfo.features.workers 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {browserInfo.features.workers ? '対応' : '非対応'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>ES Modules:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    browserInfo.features.modules 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {browserInfo.features.modules ? '対応' : '非対応'}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">総合判定:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      browserInfo.supported 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {browserInfo.supported ? '完全対応' : '要アップデート'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>ブラウザ情報を取得中...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
