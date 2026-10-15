#!/usr/bin/env node
/**
 * RCM Windows 一键打包脚本
 *
 * 产物：./package-windows/  —— 免安装、零依赖的 Windows 服务包
 *   ├── 启动服务.bat        双击启动（自动开浏览器，端口占用自动后移）
 *   ├── 停止服务.bat        一键停止
 *   ├── server.cjs          内置静态服务器（零第三方依赖，支持 SPA 回退 / gzip / 缓存）
 *   ├── 使用说明.txt
 *   ├── app/                前端构建产物（vite build 输出）
 *   └── runtime/node/       内置 Node.js 运行时（win-x64 node.exe）
 *
 * 可选生成 ./RCM-Windows-x64.zip 分发压缩包。
 *
 * 用法：
 *   node scripts/package-windows.mjs            # 完整打包（构建 + 组装 + zip）
 *   node scripts/package-windows.mjs --no-build # 跳过 vite build（复用已有 dist/）
 *   node scripts/package-windows.mjs --no-zip   # 不生成 zip
 *
 * 注意：与 deploy/ 目录完全隔离，不读写 deploy/ 下任何文件。
 */
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'package-windows');
const DIST = path.join(ROOT, 'dist');

const args = new Set(process.argv.slice(2));
const doBuild = !args.has('--no-build');
const doZip = !args.has('--no-zip');

function log(msg) {
  console.log(`[package] ${msg}`);
}

function rm(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    // 兜底：目录整体删除失败（如文件被占用）时逐项删除
    try {
      for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
        const full = path.join(p, entry.name);
        if (entry.isDirectory()) rm(full);
        else fs.unlinkSync(full);
      }
      fs.rmdirSync(p);
    } catch {
      // 仍失败则保留旧目录，后续复制会用覆盖方式刷新内容
    }
  }
}

function copyDir(src, dest) {
  fs.cpSync(src, dest, { recursive: true });
}

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

// Windows 脚本必须使用 CRLF 换行，否则 cmd 解析括号块会错乱
function writeWinFile(p, content) {
  writeFile(p, content.replace(/\r?\n/g, '\r\n'));
}

// ---------- 1. 前端构建 ----------
if (doBuild) {
  log('执行 vite build ...');
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
} else {
  log('跳过构建（--no-build），使用已有 dist/');
}
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('[package] 错误：dist/index.html 不存在，请先构建。');
  process.exit(1);
}

// ---------- 2. 组装目录 ----------
log(`清理并重建输出目录 ${OUT}`);
rm(OUT);
fs.mkdirSync(OUT, { recursive: true });

log('复制前端产物 dist/ -> package-windows/app/');
copyDir(DIST, path.join(OUT, 'app'));

log('内置 Node.js 运行时 ...');
const nodeSrc = process.env.NODE_EXE || process.execPath;
if (!fs.existsSync(nodeSrc)) {
  console.error(`[package] 错误：未找到 node.exe（${nodeSrc}），可通过环境变量 NODE_EXE 指定。`);
  process.exit(1);
}
const nodeDir = path.join(OUT, 'runtime', 'node');
fs.mkdirSync(nodeDir, { recursive: true });
fs.copyFileSync(nodeSrc, path.join(nodeDir, 'node.exe'));
const ver = spawnSync(path.join(nodeDir, 'node.exe'), ['-v'], { encoding: 'utf8' });
if (ver.status !== 0) {
  console.error('[package] 错误：内置 node.exe 无法独立运行。');
  process.exit(1);
}
log(`内置 node.exe ${ver.stdout.trim()} 就绪`);

// ---------- 3. 服务与脚本 ----------
writeFile(
  path.join(OUT, 'server.cjs'),
  `#!/usr/bin/env node
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
`
);

writeWinFile(
  path.join(OUT, '启动服务.bat'),
  `@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title RCM Platform Service
cd /d "%~dp0"

if not exist "runtime\\node\\node.exe" (
  echo [ERROR] runtime\\node\\node.exe not found.
  echo Please re-extract the package completely.
  pause
  exit /b 1
)
if not exist "app\\index.html" (
  echo [ERROR] app\\index.html not found.
  echo Please re-extract the package completely.
  pause
  exit /b 1
)

set PORT=8080
if not "%~1"=="" set PORT=%~1

REM If the port is busy, try the next one, up to +10
for /l %%i in (0,1,10) do (
  netstat -ano | findstr /r /c:":!PORT! .*LISTENING" >nul 2>&1
  if !errorlevel!==0 (
    set /a PORT+=1
  ) else (
    goto :start
  )
)
echo [WARN] Ports %~1 to %~1+10 are all in use. Please free a port and retry.
pause
exit /b 1

:start
echo ========================================
echo   RCM Platform - Starting service...
echo   Port: !PORT!
echo ========================================
start "" /min cmd /c "timeout /t 2 /nobreak >nul & start "" http://localhost:!PORT!"
"runtime\\node\\node.exe" server.cjs !PORT!
pause
`
);

writeWinFile(
  path.join(OUT, '停止服务.bat'),
  `@echo off
chcp 65001 >nul
echo Stopping RCM service (node.exe started from this package)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -Filter \\"Name='node.exe'\\" | Where-Object { $_.CommandLine -match 'server\\.cjs' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host ('Stopped PID ' + $_.ProcessId) }"
echo Done.
pause
`
);

writeWinFile(
  path.join(OUT, '使用说明.txt'),
  `\ufeff========================================
  RCM 平台 Windows 一键启动服务包
========================================

【运行要求】
Windows 10/11 x64，无需安装任何环境（Node.js 已内置）。

【快速启动】
1. 解压本压缩包到任意目录（建议路径不含中文和空格）
2. 双击「启动服务.bat」
3. 浏览器会自动打开 http://localhost:8080

【指定端口】
在命令行运行：
    启动服务.bat 9090
若端口已被占用，会自动向后尝试最多 10 个端口。

【局域网访问】
服务启动后，同一局域网内的其他电脑可通过
    http://<本机IP>:8080
访问（启动窗口中会显示局域网地址）。
首次启动如弹出 Windows 防火墙提示，请选择「允许访问」。

【停止服务】
- 在服务窗口按 Ctrl+C
- 或双击「停止服务.bat」

【目录说明】
  启动服务.bat    一键启动（双击运行）
  停止服务.bat    停止服务
  server.cjs      内置静态服务器（零依赖，支持 gzip 压缩与 SPA 路由）
  runtime\\node\\   内置 Node.js 运行时（${ver.stdout.trim()} win-x64）
  app\\            平台前端构建产物

【常见问题】
Q: 提示端口被占用？
A: 启动时会自动尝试下一个端口（窗口中会显示实际端口），
   也可手动指定：启动服务.bat 9090

Q: 双击闪退？
A: 请确认解压完整（runtime\\node\\node.exe 存在），
   且解压路径不含特殊字符。
`
);

log('写入 README.md');
writeFile(
  path.join(OUT, 'README.md'),
  `# RCM Windows 服务包

免安装 Windows 服务包：内置 Node.js 运行时与静态服务器，解压即用。

- 双击 \`启动服务.bat\` 启动（默认 8080 端口，可传参指定）
- 双击 \`停止服务.bat\` 停止
- 详细说明见 \`使用说明.txt\`

> 本目录由 \`scripts/package-windows.mjs\` 自动生成，请勿手工修改；
> 重新打包请运行 \`npm run package:win\`。
`
);

// ---------- 4. 打 zip 分发包 ----------
if (doZip) {
  const zipPath = path.join(ROOT, 'RCM-Windows-x64.zip');
  rm(zipPath);
  log(`生成 ${path.basename(zipPath)} ...`);
  const ps = [
    'Compress-Archive',
    `-Path "${path.join(OUT, '*')}"`,
    `-DestinationPath "${zipPath}"`,
    '-CompressionLevel Optimal -Force',
  ].join(' ');
  const r = spawnSync('powershell', ['-NoProfile', '-Command', ps], {
    stdio: 'inherit',
    shell: false,
  });
  if (r.status !== 0) {
    log('警告：zip 生成失败（不影响 package-windows/ 目录可用性）。');
  }
}

// ---------- 汇总 ----------
function dirSize(p) {
  let size = 0;
  for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
    const full = path.join(p, entry.name);
    size += entry.isDirectory() ? dirSize(full) : fs.statSync(full).size;
  }
  return size;
}
const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB';
log(`完成: ${OUT} (${mb(dirSize(OUT))})`);
if (doZip && fs.existsSync(path.join(ROOT, 'RCM-Windows-x64.zip'))) {
  log(`分发包: ${path.join(ROOT, 'RCM-Windows-x64.zip')} (${mb(fs.statSync(path.join(ROOT, 'RCM-Windows-x64.zip')).size)})`);
}
