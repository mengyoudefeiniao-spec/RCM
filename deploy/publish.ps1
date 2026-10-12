# RCM 教学课件 Demo - 一键发布到 Surge.sh
# 用法: powershell -ExecutionPolicy Bypass -File D:\RCM\deploy\publish.ps1 [-Domain 自定义子域名]
#
# 首次运行时 Surge 会提示输入邮箱和密码（自动注册免费账号），
# 凭据保存在本机用户目录 ~/.surge，之后再次发布无需输入。

param(
  [string]$Domain = "rcm-courseware-demo.surge.sh",
  [string]$ProjectDir = (Join-Path $PSScriptRoot "dist")
)

if (-not (Test-Path $ProjectDir)) {
  Write-Error "未找到构建产物 $ProjectDir ，请先执行: node D:\RCM\deploy\scripts\build.mjs"
  exit 1
}

Write-Host "==> 发布目录: $ProjectDir"
Write-Host "==> 目标域名: https://$Domain"
Write-Host ""

npx -y surge $ProjectDir --domain $Domain

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "==> 发布成功，访问地址: https://$Domain" -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "==> 发布失败，请检查上方错误（若域名被占用，换一个 -Domain 参数重试）" -ForegroundColor Red
}
