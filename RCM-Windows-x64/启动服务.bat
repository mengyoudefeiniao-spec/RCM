@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title RCM Platform Service
cd /d "%~dp0"

if not exist "runtime\node\node.exe" (
  echo [ERROR] runtime\node\node.exe not found.
  echo Please re-extract the package completely.
  pause
  exit /b 1
)
if not exist "app\index.html" (
  echo [ERROR] app\index.html not found.
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
"runtime\node\node.exe" server.cjs !PORT!
pause
