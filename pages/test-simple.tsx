// 最小構成テストページ - next-themesなしでハイドレーション問題をテスト
export default function TestSimple() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">シンプルテストページ</h1>
      <p>このページはnext-themesやuseEffectを使用していません。</p>
      <p>無限リロードが発生しない場合、テーマシステムが原因です。</p>
    </div>
  );
}