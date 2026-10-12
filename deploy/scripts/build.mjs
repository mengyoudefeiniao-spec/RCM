#!/usr/bin/env node
/**
 * 隔离构建脚本：以 Mock 模式构建生产静态包到 deploy/dist
 * 不修改主工程任何文件（通过命令行环境变量注入，不生成 .env）
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = path.join(root, 'deploy', 'dist');

const env = {
  ...process.env,
  VITE_APP_MOCK_MODE: 'true', // 纯前端 Mock 数据模式，分享 demo 必须开启
  VITE_APP_TITLE: '国家数字配给卡综合服务与协同管理平台',
};

console.log('[deploy] 正在以 Mock 模式构建生产包 ...');
execSync(`npx vite build --outDir "${outDir}" --emptyOutDir`, {
  cwd: root,
  env,
  stdio: 'inherit',
});
console.log(`[deploy] 构建完成 -> ${outDir}`);
