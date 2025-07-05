import Link from 'next/link';

export default function CombinedDemo() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← ホームに戻る
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">統合デモ</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card text-card-foreground p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Python実行環境</h2>
          <p className="text-center text-muted-foreground">
            Pyodideコンポーネントがここに表示されます
          </p>
        </div>
        
        <div className="bg-card text-card-foreground p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">SQL実行環境</h2>
          <p className="text-center text-muted-foreground">
            Sql.jsコンポーネントがここに表示されます
          </p>
        </div>
      </div>
    </div>
  );
}