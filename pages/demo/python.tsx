import Link from 'next/link';

export default function PythonDemo() {
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
      
      <h1 className="text-3xl font-bold mb-6">Python実行デモ</h1>
      
      <div className="bg-card text-card-foreground p-6 rounded-lg border">
        <p className="text-center text-muted-foreground">
          Pyodideコンポーネントがここに表示されます
        </p>
      </div>
    </div>
  );
}