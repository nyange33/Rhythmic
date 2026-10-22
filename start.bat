@echo off
echo Starting Rhythmic...
echo.

echo Building backend...
cd cmd\api
go build -o rhythmic-api.exe main.go
if errorlevel 1 (
    echo Failed to build backend
    pause
    exit /b 1
)
cd ..\..

echo.
echo Starting backend server...
start "Rhythmic Backend" cmd /k "cd cmd\api && rhythmic-api.exe"

echo.
echo Starting frontend server...
start "Rhythmic Frontend" cmd /k "npm run dev"

echo.
echo Servers started!
echo Backend: http://localhost:8090
echo Frontend: http://localhost:5173
echo.
pause
