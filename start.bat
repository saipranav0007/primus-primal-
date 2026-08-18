@echo off
title PRIMAL Intelligent Warehouse Operations
echo ===================================================
echo   PRIMAL — Intelligent Warehouse Operations Engine
echo   See. Decide. Fulfill.
echo ===================================================
echo Setting Node.js environment PATH...
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"

echo Starting PRIMAL Backend and Frontend...
npm run dev
pause
