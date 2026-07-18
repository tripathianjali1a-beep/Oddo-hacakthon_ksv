# Rentora launcher for Windows PowerShell.
# If double-clicking start.bat is blocked by Explorer, right-click this file
# and choose "Run with PowerShell" instead.
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js was not found on your PATH." -ForegroundColor Red
  Write-Host "Install Node 18.18+ (20 LTS recommended) from https://nodejs.org and try again."
  exit 1
}

node scripts/dev.mjs @args
