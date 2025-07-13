// 環境変数デバッグページ
export default function DebugEnv() {
  // サーバーサイドで環境変数を取得
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>環境変数デバッグ</h1>
      <h2>このページで環境変数の読み込み状況を確認できます</h2>
      
      <div style={{ marginTop: '20px' }}>
        <h3>重要な環境変数:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', border: '1px solid #ccc' }}>
          NODE_ENV: {process.env.NODE_ENV}
          {'\n'}FAST_REFRESH: {process.env.FAST_REFRESH || 'undefined'}
          {'\n'}SWC_DISABLE: {process.env.SWC_DISABLE || 'undefined'}
          {'\n'}NEXT_TELEMETRY_DISABLED: {process.env.NEXT_TELEMETRY_DISABLED || 'undefined'}
          {'\n'}HOST: {process.env.HOST || 'undefined'}
          {'\n'}PORT: {process.env.PORT || 'undefined'}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Next.js設定の確認:</h3>
        <p>この情報でNext.jsが環境変数を正しく読み込んでいるかを確認してください。</p>
        <p>FAST_REFRESH と SWC_DISABLE が 'false' と 'true' になっていれば正常です。</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>現在時刻 (更新テスト):</h3>
        <p>{new Date().toISOString()}</p>
        <p>このページが自動リロードされないことを確認してください。</p>
      </div>
    </div>
  );
}

// サーバーサイドで環境変数を確認
export async function getServerSideProps() {
  console.log('=== サーバーサイド環境変数確認 ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('FAST_REFRESH:', process.env.FAST_REFRESH);
  console.log('SWC_DISABLE:', process.env.SWC_DISABLE);
  console.log('NEXT_TELEMETRY_DISABLED:', process.env.NEXT_TELEMETRY_DISABLED);
  console.log('HOST:', process.env.HOST);
  console.log('PORT:', process.env.PORT);
  console.log('=====================================');
  
  return {
    props: {}
  };
}