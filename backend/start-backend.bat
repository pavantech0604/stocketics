@echo off
echo ========================================================
echo   Starting Stocketics Apex CRM PocketBase Backend Engine
echo   Dashboard URL: http://127.0.0.1:8090/_/
echo   REST API URL:  http://127.0.0.1:8090/api/
echo ========================================================
cd /d "%~dp0"
pocketbase.exe serve --http=0.0.0.0:8090
