import { Link } from 'react-router-dom';

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
              to="/demo/python" 
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
              to="/demo/sql" 
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
            to="/demo/combined" 
            className="inline-flex items-center justify-center rounded-md bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            統合デモを見る
          </Link>
        </div>

        {/* Pseudo Code Converter */}
        <div className="border rounded-lg p-6 mb-12 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3">擬似言語変換エンジン</h2>
          <p className="text-gray-600 mb-4">
            IPA応用情報技術者試験の擬似言語をPythonコードに自動変換。ルールベース変換とAST解析を組み合わせた高精度変換エンジンです。
          </p>
          <Link 
            to="/demo/converter" 
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            変換エンジンを試す
          </Link>
        </div>

        {/* Problems Demo */}
        <div className="border rounded-lg p-6 mb-12 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3">問題データ確認デモ</h2>
          <p className="text-gray-600 mb-4">
            作成した問題データの詳細確認・JSONデータの可視化・各問題への詳細ナビゲーション
          </p>
          <Link 
            to="/demo/problems" 
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            問題データを見る
          </Link>
        </div>

        {/* Actual Learning Experience */}
        <div className="border rounded-lg p-6 mb-12 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-blue-50">
          <div className="flex items-center mb-3">
            <h2 className="text-xl font-semibold">実際の学習体験</h2>
            <span className="ml-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">NEW</span>
          </div>
          <p className="text-gray-600 mb-4">
            完全な穴埋め問題による学習フローを体験。実際の試験問題で学習できます。
          </p>
          <Link 
            to="/problems" 
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 text-sm font-medium hover:from-green-700 hover:to-blue-700 transition-colors"
          >
            学習を始める →
          </Link>
        </div>
      </div>
    </div>
  );
}