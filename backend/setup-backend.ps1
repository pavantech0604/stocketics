# PowerShell script to download and setup PocketBase for Apex CRM on Windows
$ErrorActionPreference = "Stop"

$backendDir = "$PSScriptRoot"
if (-not (Test-Path $backendDir)) {
    New-Item -ItemType Directory -Path $backendDir -Force | Out-Null
}

$exePath = Join-Path $backendDir "pocketbase.exe"
$batPath = Join-Path $backendDir "start-backend.bat"

# Create start-backend.bat
$batContent = @"
@echo off
echo ========================================================
echo   Starting Stocketics Apex CRM PocketBase Backend Engine
echo   Dashboard URL: http://127.0.0.1:8090/_/
echo   REST API URL:  http://127.0.0.1:8090/api/
echo ========================================================
cd /d "%~dp0"
pocketbase.exe serve --http=127.0.0.1:8090
"@
Set-Content -Path $batPath -Value $batContent -Encoding ASCII
Write-Host "Created $batPath" -ForegroundColor Green

if (Test-Path $exePath) {
    Write-Host "PocketBase executable already exists at $exePath" -ForegroundColor Green
    exit 0
}

Write-Host "Downloading PocketBase for Windows (amd64)..." -ForegroundColor Cyan

# Known reliable PocketBase versions
$versions = @("v0.25.9", "v0.25.8", "v0.24.4", "v0.22.28")
$downloaded = $false
$zipPath = Join-Path $backendDir "pocketbase.zip"

foreach ($v in $versions) {
    $versionNum = $v.TrimStart('v')
    $url = "https://github.com/pocketbase/pocketbase/releases/download/$v/pocketbase_${versionNum}_windows_amd64.zip"
    Write-Host "Attempting download from: $url" -ForegroundColor Yellow
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
        Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing
        $downloaded = $true
        Write-Host "Successfully downloaded PocketBase $v" -ForegroundColor Green
        break
    } catch {
        Write-Warning "Failed downloading $v, trying next fallback..."
    }
}

if (-not $downloaded) {
    Write-Error "Failed to download PocketBase from GitHub Releases. Please check internet connection or manually place pocketbase.exe in $backendDir"
    exit 1
}

Write-Host "Extracting PocketBase archive..." -ForegroundColor Cyan
Expand-Archive -Path $zipPath -DestinationPath $backendDir -Force
Remove-Item -Path $zipPath -Force

if (Test-Path $exePath) {
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "PocketBase successfully installed in $backendDir" -ForegroundColor Green
    Write-Host "Run npm run backend or backend\start-backend.bat to start" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Error "Extraction failed. pocketbase.exe not found in $backendDir"
    exit 1
}
