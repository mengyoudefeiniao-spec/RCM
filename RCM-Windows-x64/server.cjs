#!/usr/bin/env node
/**
 * RCM 零依赖静态文件服务器（SPA 支持 + gzip + 缓存）
 * 用法: node server.cjs [端口] (默认 8080)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = parseInt(process.argv[2] || process.env.PORT || '8080', 10);
const ROOT = path.join(__dirname, 'app');
const HOST = '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

const COMPRESSIBLE = new Set([
  '.html', '.js', '.mjs', '.css', '.json', '.svg', '.txt', '.map',
]);

function getLanIp() {
  const os = require('os');
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.1.1';
}

const server = http.createServer((req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end('Method Not Allowed');
    }

    let urlPath;
    try {
      urlPath = decodeURIComponent(req.url.split('?')[0]);
    } catch {
      res.writeHead(400);
      return res.end('Bad Request');
    }
    if (urlPath === '/') urlPath = '/index.html';

    // 防目录穿越
    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    let target = filePath;
    let stat = null;
    try {
      stat = fs.statSync(target);
      if (stat.isDirectory()) {
        target = path.join(target, 'index.html');
        stat = fs.statSync(target);
      }
    } catch {
      // SPA 回退：所有未命中路径返回 index.html
      target = path.join(ROOT, 'index.html');
      try {
        stat = fs.statSync(target);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 Not Found');
      }
    }

    const ext = path.extname(target).toLowerCase();
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400',
      'Last-Modified': stat.mtime.toUTCString(),
    };

    const canGzip =
      COMPRESSIBLE.has(ext) &&
      stat.size > 1024 &&
      stat.size < 8 * 1024 * 1024 &&
      String(req.headers['accept-encoding'] || '').includes('gzip');

    if (req.method === 'HEAD') {
      headers['Content-Length'] = stat.size;
      res.writeHead(200, headers);
      return res.end();
    }

    if (canGzip) {
      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';
      res.writeHead(200, headers);
      fs.createReadStream(target)
        .pipe(zlib.createGzip({ level: 6 }))
        .pipe(res)
        .on('error', () => res.destroy());
    } else {
      headers['Content-Length'] = stat.size;
      res.writeHead(200, headers);
      fs.createReadStream(target)
        .on('error', () => res.destroy())
        .pipe(res);
    }
  } catch (err) {
    try {
      res.writeHead(500);
      res.end('Internal Server Error');
    } catch {
      /* 已响应，忽略 */
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log('========================================');
  console.log('  RCM 平台服务已启动');
  console.log('  本机访问:   http://localhost:' + PORT);
  console.log('  局域网访问: http://' + getLanIp() + ':' + PORT);
  console.log('  按 Ctrl+C 停止服务');
  console.log('========================================');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('[错误] 端口 ' + PORT + ' 已被占用，请关闭占用程序或换一个端口启动。');
  } else {
    console.error('[错误]', err.message);
  }
  process.exit(1);
});
