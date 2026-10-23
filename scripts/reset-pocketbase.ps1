param(
    [string]$PocketBaseUrl = 'https://pb.51xyu.com',
    [string]$Collection = 'app_data'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$resetScript = Join-Path $repoRoot 'scripts\reset-pocketbase-data.mjs'

Write-Output "Target: $PocketBaseUrl / $Collection"
Write-Output 'This restores the four localized family records (at most 4 members each), empties the four ration-order records, initializes the 19-governorate list while preserving current agent/site records, and adds multilingual Article 140 center names and governorates to the business-rules record.'
$confirmation = Read-Host 'Type RESET to continue'
if ($confirmation -cne 'RESET') {
    Write-Output 'Reset cancelled.'
    exit 0
}

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
        node $resetScript --apply
        if ($LASTEXITCODE -ne 0) { throw 'PocketBase data reset failed.' }
    } finally {
        Pop-Location
    }
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    $adminPassword = $null
    Remove-Item Env:POCKETBASE_URL, Env:POCKETBASE_COLLECTION, Env:POCKETBASE_ADMIN_EMAIL, Env:POCKETBASE_ADMIN_PASSWORD -ErrorAction SilentlyContinue
}
