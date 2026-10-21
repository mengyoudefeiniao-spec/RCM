param(
    [ValidateSet('Debug', 'Release')]
    [string]$Variant = 'Debug',
    [ValidateSet('PocketBase', 'Offline')]
    [string]$DataMode = 'PocketBase',
    [string]$PocketBaseUrl = 'https://pb.51xyu.com',
    [string]$PocketBaseCollection = 'app_data',
    [string]$PocketBaseFilesCollection = 'app_files'
)

$ErrorActionPreference = 'Stop'
$packageRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$sourceRoot = (Resolve-Path (Join-Path $packageRoot '..')).Path
$javaHome = 'C:\Program Files\Java\jdk-17.0.8'
$sdkRoot = Join-Path $packageRoot 'android-sdk'
$gradleBin = Join-Path $packageRoot 'android-tools\gradle-8.9\bin'
$gradle = Join-Path $gradleBin 'gradle.bat'
$vite = Join-Path $sourceRoot 'node_modules\.bin\vite.cmd'

if (-not (Test-Path (Join-Path $javaHome 'bin\java.exe'))) { throw "JDK 17 was not found at $javaHome" }
if (-not (Test-Path (Join-Path $sdkRoot 'platforms\android-35\android.jar'))) { throw 'Android SDK Platform 35 is missing from app-package\android-sdk.' }
if (-not (Test-Path $gradle)) { throw "Gradle 8.9 was not found at $gradle" }
if (-not (Test-Path $vite)) { throw 'Project frontend dependencies are missing. Run npm install from the repository root first.' }

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:GRADLE_USER_HOME = Join-Path $packageRoot 'gradle-user-home'
$env:VITE_APP_MOCK_MODE = 'true'
$env:VITE_APP_API_BASE_URL = '/api'
$env:VITE_POCKETBASE_SYNC = if ($DataMode -eq 'PocketBase') { 'true' } else { 'false' }
$env:VITE_POCKETBASE_URL = $PocketBaseUrl.TrimEnd('/')
$env:VITE_POCKETBASE_COLLECTION = $PocketBaseCollection
$env:VITE_POCKETBASE_FILES_COLLECTION = $PocketBaseFilesCollection
$pocketBaseUri = [Uri]$env:VITE_POCKETBASE_URL
if ($DataMode -eq 'PocketBase' -and ($pocketBaseUri.Scheme -ne 'https' -or -not $pocketBaseUri.Host)) {
    throw 'PocketBase builds require a valid HTTPS PocketBase URL.'
}
$pocketBaseHost = $pocketBaseUri.Host
$env:Path = "$javaHome\bin;$gradleBin;$sdkRoot\platform-tools;$env:Path"

python (Join-Path $packageRoot 'scripts\generate-icons.py')
if ($LASTEXITCODE -ne 0) { throw 'Generating launcher icons failed.' }

node (Join-Path $packageRoot 'scripts\prepare-webview-source.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Preparing the APK-specific responsive layout failed.' }

node (Join-Path $packageRoot 'scripts\prepare-arabic-adapter.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Preparing the APK-specific Arabic transfer data failed.' }

& $vite build --config (Join-Path $packageRoot 'vite.config.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Android frontend build failed.' }

node (Join-Path $packageRoot 'scripts\package-android.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Bundling static resources and initialization data failed.' }

Push-Location (Join-Path $packageRoot 'android')
try {
    & $gradle --offline --no-daemon --max-workers=1 "-PPocketBaseHost=$pocketBaseHost" "assembleCitizen$Variant" "assembleAgent$Variant"
    if ($LASTEXITCODE -ne 0) { throw 'Android APK build failed.' }
} finally {
    Pop-Location
}

$flavorDirectory = $Variant.ToLowerInvariant()
$outputRoot = Join-Path $packageRoot 'output'
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
$citizenApk = Join-Path $packageRoot "android\app\build\outputs\apk\citizen\$flavorDirectory\app-citizen-$flavorDirectory.apk"
$agentApk = Join-Path $packageRoot "android\app\build\outputs\apk\agent\$flavorDirectory\app-agent-$flavorDirectory.apk"
$modeSuffix = $DataMode.ToLowerInvariant()
$citizenOutput = Join-Path $outputRoot "RCM-Citizen-$modeSuffix-$flavorDirectory.apk"
$agentOutput = Join-Path $outputRoot "RCM-Agent-$modeSuffix-$flavorDirectory.apk"
Copy-Item -LiteralPath $citizenApk -Destination $citizenOutput -Force
Copy-Item -LiteralPath $agentApk -Destination $agentOutput -Force
Write-Output "Citizen APK: $citizenOutput"
Write-Output "Agent APK:   $agentOutput"
Write-Output "Data mode:   $DataMode"
if ($DataMode -eq 'PocketBase') { Write-Output "PocketBase:  $env:VITE_POCKETBASE_URL" }
