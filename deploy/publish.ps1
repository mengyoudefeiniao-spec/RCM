# RCM Courseware Demo - one-click publish to Surge.sh
# Usage: powershell -ExecutionPolicy Bypass -File D:\RCM\deploy\publish.ps1 [-Domain your-name.surge.sh]
#
# First run prompts for email + password (auto-registers a free account).
# Credentials are stored locally in ~/.surge for future deploys.

param(
  [string]$Domain = "rcm-courseware-demo.surge.sh",
  [string]$ProjectDir = (Join-Path $PSScriptRoot "dist")
)

if (-not (Test-Path $ProjectDir)) {
  Write-Error "Build output not found: $ProjectDir . Run first: node D:\RCM\deploy\scripts\build.mjs"
  exit 1
}

Write-Host "==> Project dir: $ProjectDir"
Write-Host "==> Target URL : https://$Domain"
Write-Host ""

npx -y surge $ProjectDir --domain $Domain

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "==> Published successfully: https://$Domain" -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "==> Publish failed. If the domain is taken, retry with: -Domain another-name.surge.sh" -ForegroundColor Red
}
