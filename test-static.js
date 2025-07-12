#!/usr/bin/env node

// 静的HTTPサーバーでNext.jsを完全にバイパスしたテスト
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // デフォルトページ
  if (pathname === '/') {
    pathname = '/test.html';
  }

  const filePath = path.join(__dirname, 'public', pathname);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>静的サーバーテスト</title></head>
          <body>
            <h1>静的HTTPサーバーテスト</h1>
            <p>ファイルが見つかりません: ${pathname}</p>
            <p>利用可能なテストページ:</p>
            <ul>
              <li><a href="/test.html">プレーンHTMLテスト</a></li>
            </ul>
            <p style="margin-top: 20px;">
              <strong>このページが無限リロードしない場合、問題はNext.js側にあります。</strong>
            </p>
            <p>現在時刻: ${new Date().toISOString()}</p>
          </body>
        </html>
      `);
      return;
    }

    // ファイルタイプを判定
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.json') contentType = 'application/json';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 静的HTTPサーバーが起動しました: http://localhost:${PORT}`);
  console.log('📋 利用可能なテストページ:');
  console.log(`   - http://localhost:${PORT}/test.html`);
  console.log('');
  console.log('💡 このサーバーはNext.jsを完全にバイパスしています');
  console.log('   無限リロードが発生しない場合、問題はNext.js側です');
  console.log('');
  console.log('🛑 サーバーを停止するには Ctrl+C を押してください');
});

process.on('SIGINT', () => {
  console.log('\n👋 静的HTTPサーバーを停止しました');
  process.exit(0);
});