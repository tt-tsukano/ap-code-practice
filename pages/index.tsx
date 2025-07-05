import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          ブラウザ内 Python・SQL 実行環境
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          PyodideとSql.jsを使用して、ブラウザ内でPythonコードとSQLクエリを実行できるデモアプリケーションです。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Python実行環境</h2>
            <p className="text-muted-foreground mb-4">
              Pyodideを使用してブラウザ内でPythonコードを実行
            </p>
            <Link 
              href="/demo/python" 
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Python デモを見る
            </Link>
          </div>
          
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">SQL実行環境</h2>
            <p className="text-muted-foreground mb-4">
              Sql.jsを使用してブラウザ内でSQLクエリを実行
            </p>
            <Link 
              href="/demo/sql" 
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              SQL デモを見る
            </Link>
          </div>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">統合デモ</h2>
          <p className="text-muted-foreground mb-4">
            PythonとSQLを組み合わせたデモンストレーション
          </p>
          <Link 
            href="/demo/combined" 
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            統合デモを見る
          </Link>
        </div>
      </div>
    </div>
  );
}
