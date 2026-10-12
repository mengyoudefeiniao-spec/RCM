# RCM 教学课件 Demo — 部署目录（与主工程完全隔离）

本目录仅用于构建与发布，**不修改主工程任何现有代码**。

主工程为纯前端 Vue3 + Vite SPA（数据由内置 Mock 适配器提供），
构建为静态文件后可托管到任意静态网站服务。

## 目录结构

- `scripts/build.mjs`  隔离构建脚本（以 Mock 模式输出到 `deploy/dist`）
- `publish.ps1`        一键发布脚本（Surge.sh 免费静态托管）
- `dist/`              构建产物（发布后可删除）

## 构建并本地预览

```powershell
node D:\RCM\deploy\scripts\build.mjs
# 本地验证（可选）
npx vite preview --outDir D:\RCM\deploy\dist --port 4173
```

## 发布到互联网（Surge.sh）

```powershell
powershell -ExecutionPolicy Bypass -File D:\RCM\deploy\publish.ps1
```

首次运行会提示输入邮箱和密码（自动注册免费账号，凭据仅保存在本机 `~/.surge`）。
成功后得到公网地址：`https://rcm-courseware-demo.surge.sh`

换域名 / 域名被占用时：

```powershell
powershell -ExecutionPolicy Bypass -File D:\RCM\deploy\publish.ps1 -Domain your-name.surge.sh
```

## 更新发布

修改主工程代码后，重新构建再发布即可：

```powershell
node D:\RCM\deploy\scripts\build.mjs
powershell -ExecutionPolicy Bypass -File D:\RCM\deploy\publish.ps1
```
