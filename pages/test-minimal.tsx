// 最小限のNext.jsページ - import一切なし
export default function TestMinimal() {
  return (
    <div>
      <h1>最小限テストページ</h1>
      <p>このページはimport文を一切使用していません。</p>
      <p>現在時刻: {new Date().toLocaleString('ja-JP')}</p>
      <button onClick={() => alert('ボタンが動作しています')}>
        テストボタン
      </button>
    </div>
  );
}