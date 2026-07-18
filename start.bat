@echo off
setlocal
REM Rentora launcher for Windows (double-clickable).
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on your PATH.
  echo Install Node 18.18+ ^(20 LTS recommended^) from https://nodejs.org and try again.
  pause
  exit /b 1
)

node scripts\dev.mjs %*
if errorlevel 1 (
  pause
)
