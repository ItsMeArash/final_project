@echo off
REM Admin Dashboard Development Script (Batch File)
REM Usage: dev.bat [command]

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="dev" goto dev
if "%1"=="install" goto install
if "%1"=="backend" goto backend
if "%1"=="frontend" goto frontend
if "%1"=="create-admin" goto create-admin
if "%1"=="build" goto build
if "%1"=="clean" goto clean
if "%1"=="stop" goto stop
goto help

:help
echo.
echo Admin Dashboard - Available Commands:
echo.
echo   dev.bat dev           - Start both backend and frontend servers
echo   dev.bat install       - Install all dependencies
echo   dev.bat backend       - Start only backend server
echo   dev.bat frontend      - Start only frontend server
echo   dev.bat create-admin  - Create admin user
echo   dev.bat build         - Build for production
echo   dev.bat clean         - Clean build artifacts
echo   dev.bat stop          - Stop all running servers
echo.
goto end

:dev
echo.
echo Starting development servers...
echo Backend: http://localhost:4010
echo Frontend: http://localhost:4011
echo.
start "Backend Server" cmd /k "cd backend && go run cmd/server/main.go"
timeout /t 2 /nobreak >nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo Both servers started in separate windows!
goto end

:install
echo.
echo Installing dependencies...
echo Installing backend dependencies...
cd backend
go mod download
if errorlevel 1 (
    echo Backend installation failed!
    cd ..
    goto end
)
cd ..
echo Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo Frontend installation failed!
    cd ..
    goto end
)
cd ..
echo All dependencies installed!
goto end

:backend
echo.
echo Starting backend server on http://localhost:4010...
cd backend
go run cmd/server/main.go
goto end

:frontend
echo.
echo Starting frontend server on http://localhost:4011...
cd frontend
call npm run dev
goto end

:create-admin
echo.
echo Creating admin user...
cd backend
go run scripts/create_admin.go admin password123 "Admin User"
if errorlevel 1 (
    echo Failed to create admin user!
) else (
    echo Admin user created!
    echo Username: admin
    echo Password: password123
)
cd ..
goto end

:build
echo.
echo Building for production...
echo Building backend...
cd backend
go build -o server.exe cmd/server/main.go
if errorlevel 1 (
    echo Backend build failed!
    cd ..
    goto end
)
cd ..
echo Building frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo Frontend build failed!
    cd ..
    goto end
)
cd ..
echo Build complete!
goto end

:clean
echo.
echo Cleaning build artifacts...
if exist backend\server.exe del /f backend\server.exe
if exist frontend\.next rmdir /s /q frontend\.next
if exist frontend\node_modules\.cache rmdir /s /q frontend\node_modules\.cache
echo Clean complete!
goto end

:stop
echo.
echo Stopping servers...
echo Note: This will attempt to stop processes on ports 4010 and 4011
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4010') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4011') do taskkill /F /PID %%a 2>nul
echo Servers stopped!
goto end

:end

