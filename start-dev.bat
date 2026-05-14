@echo off
echo Starting Coffee Shop Application...
echo.

echo 1. Starting Backend (port 3000)...
start "Backend" cmd /c "cd /d %~dp0backend && bun run src/index.ts"

echo 2. Starting Frontend (port 5173)...
start "Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo Health:   http://localhost:3000/health
echo.
echo Default login: admin / admin123
