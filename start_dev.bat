@echo off
echo Starting sARA2 Development Server...

echo Starting Backend Server on port 5000...
start "Backend Server" cmd /k "cd /d %~dp0 && node server.js"

timeout /t 3 /nobreak > nul

echo Starting Frontend Client on port 3000...
start "Frontend Client" cmd /k "cd /d %~dp0client && npm start"

echo Both servers are starting...
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5000
echo.
echo Note: Wait for both servers to fully start before accessing the website
pause
