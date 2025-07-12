#!/usr/bin/env node

// ポート3000の使用状況をチェック
const { exec } = require('child_process');

console.log('🔍 ポート3000の使用状況をチェック中...\n');

// ポート3000を使用しているプロセスをチェック
exec('lsof -i :3000', (error, stdout, stderr) => {
  if (error) {
    console.log('✅ ポート3000は使用されていません');
  } else {
    console.log('⚠️  ポート3000を使用しているプロセス:');
    console.log(stdout);
    console.log('\n💡 既存のプロセスを終了してから開発サーバーを起動してください');
  }
});

// Next.jsプロセスをチェック
exec('ps aux | grep "next dev"', (error, stdout, stderr) => {
  if (stdout && stdout.includes('next dev')) {
    console.log('\n⚠️  実行中のNext.jsプロセス:');
    console.log(stdout);
    console.log('\n💡 既存のNext.jsプロセスを終了してください: killall node');
  } else {
    console.log('\n✅ Next.jsプロセスは実行されていません');
  }
});

// 環境変数チェック
console.log('\n📊 環境変数の確認:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('FAST_REFRESH:', process.env.FAST_REFRESH || 'undefined');
console.log('SWC_DISABLE:', process.env.SWC_DISABLE || 'undefined');
console.log('NEXT_TELEMETRY_DISABLED:', process.env.NEXT_TELEMETRY_DISABLED || 'undefined');

// .env.localファイルの存在確認
const fs = require('fs');
const path = require('path');

console.log('\n📁 .env.localファイルの確認:');
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.localファイルが存在します');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('📄 .env.localの内容:');
    console.log(content);
  } catch (err) {
    console.log('❌ .env.localの読み込みエラー:', err.message);
  }
} else {
  console.log('❌ .env.localファイルが存在しません！');
  console.log('💡 プロジェクトルートに.env.localファイルを作成してください');
}