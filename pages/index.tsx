import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            ブラウザ内 Python・SQL 実行環境
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            PyodideとSql.jsを使用して、ブラウザ内でPythonコードとSQLクエリを実行できるデモアプリケーションです。
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-3">Python実行環境</h2>
            <p className="text-gray-600 mb-4">
              Pyodideを使用してブラウザ内でPythonコードを実行。フィボナッチ数列やデータ処理のデモが利用可能です。
            </p>
            <Link 
              href="/demo/python" 
              className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Python デモを見る
            </Link>
          </div>
          
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-3">SQL実行環境</h2>
            <p className="text-gray-600 mb-4">
              Sql.jsを使用してブラウザ内でSQLクエリを実行。学生データベースのサンプルで試すことができます。
            </p>
            <Link 
              href="/demo/sql" 
              className="inline-flex items-center justify-center rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 transition-colors"
            >
              SQL デモを見る
            </Link>
          </div>
        </div>
        
        {/* Combined Demo */}
        <div className="border rounded-lg p-6 mb-12 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3">統合デモ</h2>
          <p className="text-gray-600 mb-4">
            PythonとSQLを組み合わせたデモンストレーション。両方の実行環境を同時に利用できます。
          </p>
          <Link 
            href="/demo/combined" 
            className="inline-flex items-center justify-center rounded-md bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            統合デモを見る
          </Link>
        </div>

        {/* Test Simple Page Link */}
        <div className="border rounded-lg p-6 mb-12 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3">テストページ</h2>
          <p className="text-gray-600 mb-4">
            最小構成のテストページ。無限リロード問題の切り分けに使用。
          </p>
          <Link 
            href="/test-simple" 
            className="inline-flex items-center justify-center rounded-md bg-gray-600 text-white px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            テストページを見る
          </Link>
        </div>
      </div>
    </div>
  );
}