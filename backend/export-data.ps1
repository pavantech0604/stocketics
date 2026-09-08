# Powershell script to package the PocketBase database for transfer to your dedicated server
$ErrorActionPreference = "Stop"

$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PbDataDir = Join-Path $BackendDir "pb_data"
$ZipOutput = Join-Path $BackendDir "pb_data_export.zip"

if (-not (Test-Path $PbDataDir)) {
    Write-Error "Could not find pb_data directory at $PbDataDir"
    exit 1
}

Write-Host "Creating export archive: $ZipOutput ..." -ForegroundColor Cyan

# Remove old export if exists
if (Test-Path $ZipOutput) {
    Remove-Item $ZipOutput -Force
}

# Compress pb_data
Compress-Archive -Path "$PbDataDir\*" -DestinationPath $ZipOutput -CompressionLevel Optimal

Write-Host "`nSUCCESS! Database exported to:" -ForegroundColor Green
Write-Host "$ZipOutput" -ForegroundColor Yellow
Write-Host "`nYou can now upload this file to your remote server." -ForegroundColor Cyan
