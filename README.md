# RCM

当前前端使用 Vue 3 + Vite，持续更新的分支为 `master`。仓库默认分支目前仍为 `main`，其中是早期 React 实现，不包含 `/#/portal`。新电脑克隆时请明确选择 `master`。

## 新电脑启动

```powershell
git clone --branch master https://github.com/mengyoudefeiniao-spec/RCM.git
cd RCM
npm ci
Copy-Item .env.example .env
npm run dev
```

打开 http://localhost:3000/#/portal 。该路由为公开页面，无需登录，也不受环境变量开关控制。直接打开根地址 `/` 会根据登录状态进入登录页或角色首页，不会自动进入门户。

已有工作目录请先检查是否有本地改动，再更新分支和依赖：

```powershell
git status --short --branch
git remote -v
git fetch origin --prune
git switch master
git pull --ff-only origin master
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

先在原终端用 Ctrl+C 停止旧的开发服务，再执行更新和启动命令。开发服务固定使用 3000 端口；端口已占用时直接报错，避免新服务自动切换到其他端口后，浏览器仍访问旧服务。

## 环境文件

`.env` 和 `.env.local` 按设计不提交到 Git；模板 `.env.example` 已提交。不要把其他电脑上的凭据提交到仓库。

- 模板中的 `VITE_APP_MOCK_MODE=true` 启用演示 API。不复制模板时，该值默认为未启用，可能导致接口请求失败，但不会切换到旧版界面或移除门户路由。
- 模板中的 `VITE_POCKETBASE_SYNC=false` 使用当前浏览器的本地演示数据。如需跨设备共享业务数据，参照 [POCKETBASE.md](POCKETBASE.md) 配置 PocketBase。是否启用数据同步不会改变前端代码版本。
- `.env.local` 可包含本机华为 IAM 配置，参照 [华为人脸核验说明](docs/huawei-face-demo.md)。缺少这些配置不会隐藏门户。

修改环境变量后需要重启开发服务；静态包需重新构建。

## 页面版本不一致时检查

在实际执行 `npm run dev` 的目录运行：

```powershell
git remote get-url origin
git branch --show-current
git fetch origin --prune
git log -1 --oneline
git log -1 --oneline origin/master
git rev-list --left-right --count HEAD...origin/master
git status --short
Test-Path src/views/portal/PortalView.vue
Select-String -Path src/router/index.js -Pattern "path: '/portal'"
```

应满足：远端指向本项目，当前分支为 `master`，两个提交号一致，提交差异为 `0 0`，工作目录没有意外改动，门户文件和路由均存在。若分支显示 `main`，说明运行的是早期实现。

若上述结果都正确但浏览器仍显示旧版，请检查 3000 端口对应的进程和启动目录：

```powershell
$listeners = Get-NetTCPConnection -State Listen -LocalPort 3000
$listeners | Select-Object LocalAddress, LocalPort, OwningProcess
$listeners.OwningProcess | Sort-Object -Unique | ForEach-Object {
    Get-CimInstance Win32_Process -Filter "ProcessId = $_" |
        Select-Object ProcessId, ExecutablePath, CommandLine
}
```

确认进程属于哪个项目后，在对应终端用 Ctrl+C 停止，再从本项目根目录启动。浏览器开发者工具的 Network 中，当前开发入口应为 `/src/main.js`；`/src/main.tsx` 是早期 React 入口，`/assets/index-*.js` 则是静态构建。可用无痕窗口排除浏览器缓存；不要直接清空站点存储，其中可能有本地演示业务数据。

## 不同启动入口

| 启动方式 | 实际读取内容 | 更新方式 |
| --- | --- | --- |
| 根目录 `npm run dev` | 当前 `src/` 源码 | 拉取 `master`、更新依赖、重启服务 |
| `npm run preview` | 上次生成的 `dist/` | 先执行 `npm run build`，再预览；默认端口为 4173 |
| `deploy/` 中的发布或预览 | `deploy/dist/` 静态构建 | 参照 [部署说明](deploy/README.md) 重新构建、发布 |
| `RCM-Windows-x64/启动服务.bat` | 该目录下 `app/` 中的历史静态包 | 根目录执行 `npm run package:win`，使用新生成的 `package-windows/` 或压缩包 |
| 已安装的 Android APK | 安装时内置的前端 | 参照 [Android 打包说明](app-package/README.md) 重新打包、安装 |

`git pull` 不会自动执行构建、替换正在运行的服务或更新已安装的应用。Windows 打包脚本的输出目录是 `package-windows/`，不会刷新仓库里已有的 `RCM-Windows-x64/` 目录。
