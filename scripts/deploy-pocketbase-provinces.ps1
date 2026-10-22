param(
    [string]$PocketBaseUrl = 'https://pb.51xyu.com',
    [string]$Collection = 'app_data'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$seedScript = Join-Path $repoRoot 'scripts\reset-pocketbase-data.mjs'

Write-Output "Target: $PocketBaseUrl / $Collection"
Write-Output 'This upserts only the 19-province agent hierarchy record and preserves existing custom province, agent, and site nodes.'
$adminEmail = Read-Host 'PocketBase superuser email'
$securePassword = Read-Host 'PocketBase superuser password' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $adminPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $env:POCKETBASE_URL = $PocketBaseUrl
    $env:POCKETBASE_COLLECTION = $Collection
    $env:POCKETBASE_ADMIN_EMAIL = $adminEmail
    $env:POCKETBASE_ADMIN_PASSWORD = $adminPassword
    Push-Location $repoRoot
    try {
        node $seedScript --provinces-only --apply
        if ($LASTEXITCODE -ne 0) { throw 'PocketBase province data deployment failed.' }
    } finally {
        Pop-Location
    }
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    $adminPassword = $null
    Remove-Item Env:POCKETBASE_URL, Env:POCKETBASE_COLLECTION, Env:POCKETBASE_ADMIN_EMAIL, Env:POCKETBASE_ADMIN_PASSWORD -ErrorAction SilentlyContinue
}
