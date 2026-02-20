# Admin Dashboard Development Script
# Usage: .\dev.ps1 [command]
# Commands: dev, install, backend, frontend, create-admin, build, clean, stop

param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "install", "backend", "frontend", "create-admin", "build", "clean", "stop", "status", "help")]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host ""
    Write-Host "Admin Dashboard - Available Commands:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  .\dev.ps1 dev           - Start both backend and frontend servers" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 install       - Install all dependencies (backend + frontend)" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 backend       - Start only backend server" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 frontend      - Start only frontend server" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 create-admin  - Create admin user (username: admin, password: password123)" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 build         - Build both backend and frontend for production" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 clean         - Clean build artifacts" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 stop          - Stop all running servers" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 status        - Check status of servers and configuration" -ForegroundColor Yellow
    Write-Host ""
}

function Start-Dev {
    Write-Host ""
    Write-Host "Starting development servers..." -ForegroundColor Green
    Write-Host "Backend: http://localhost:4010" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:4011" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
    Write-Host ""
    
    # Start backend in new window
    $backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server (Port 4010)' -ForegroundColor Green; go run cmd/server/main.go" -PassThru
    
    # Wait a moment for backend to start
    Start-Sleep -Seconds 2
    
    # Start frontend in new window
    $frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Frontend Server (Port 4011)' -ForegroundColor Green; npm run dev" -PassThru
    
    Write-Host "[OK] Both servers started in separate windows!" -ForegroundColor Green
    Write-Host "Backend PID: $($backendJob.Id)" -ForegroundColor Gray
    Write-Host "Frontend PID: $($frontendJob.Id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To stop servers, close the windows or run: .\dev.ps1 stop" -ForegroundColor Yellow
}

function Install-Dependencies {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Green
    
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location backend
    go mod download
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Backend installation failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
    
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Frontend installation failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
    
    Write-Host "[OK] All dependencies installed!" -ForegroundColor Green
}

function Start-Backend {
    Write-Host ""
    Write-Host "Starting backend server on http://localhost:4010..." -ForegroundColor Green
    Set-Location backend
    go run cmd/server/main.go
}

function Start-Frontend {
    Write-Host ""
    Write-Host "Starting frontend server on http://localhost:4011..." -ForegroundColor Green
    Set-Location frontend
    npm run dev
}

function Create-Admin {
    Write-Host ""
    Write-Host "Creating admin user..." -ForegroundColor Green
    Set-Location backend
    go run scripts/create_admin.go admin password123 "Admin User"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Admin user created!" -ForegroundColor Green
        Write-Host "Username: admin" -ForegroundColor Cyan
        Write-Host "Password: password123" -ForegroundColor Cyan
    } else {
        Write-Host "[X] Failed to create admin user!" -ForegroundColor Red
    }
    Set-Location ..
}

function Build-All {
    Write-Host ""
    Write-Host "Building for production..." -ForegroundColor Green
    
    Write-Host "Building backend..." -ForegroundColor Cyan
    Set-Location backend
    go build -o server.exe cmd/server/main.go
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Backend build failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
    
    Write-Host "Building frontend..." -ForegroundColor Cyan
    Set-Location frontend
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Frontend build failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
    
    Write-Host "[OK] Build complete!" -ForegroundColor Green
}

function Clean-Artifacts {
    Write-Host ""
    Write-Host "Cleaning build artifacts..." -ForegroundColor Green
    
    if (Test-Path "backend\server.exe") {
        Remove-Item "backend\server.exe" -Force
        Write-Host "Removed backend/server.exe" -ForegroundColor Gray
    }
    
    if (Test-Path "frontend\.next") {
        Remove-Item "frontend\.next" -Recurse -Force
        Write-Host "Removed frontend/.next" -ForegroundColor Gray
    }
    
    if (Test-Path "frontend\node_modules\.cache") {
        Remove-Item "frontend\node_modules\.cache" -Recurse -Force
        Write-Host "Removed frontend/node_modules/.cache" -ForegroundColor Gray
    }
    
    Write-Host "[OK] Clean complete!" -ForegroundColor Green
}

function Stop-Servers {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Green
    
    $backendProcesses = Get-Process | Where-Object { $_.CommandLine -like "*go run cmd/server/main.go*" -or $_.Path -like "*go.exe*" } | Where-Object { $_.MainWindowTitle -like "*Backend*" -or $_.CommandLine -like "*backend*" }
    $frontendProcesses = Get-Process | Where-Object { $_.Name -eq "node" } | Where-Object { $_.CommandLine -like "*next dev*" }
    
    # Try to stop by process name patterns
    Get-Process | Where-Object { $_.ProcessName -eq "go" } | Where-Object { $_.Path -like "*go.exe*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process | Where-Object { $_.ProcessName -eq "node" } | Where-Object { $_.MainWindowTitle -like "*Frontend*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Alternative: Stop by port (requires netstat)
    $backendPort = Get-NetTCPConnection -LocalPort 4010 -ErrorAction SilentlyContinue
    $frontendPort = Get-NetTCPConnection -LocalPort 4011 -ErrorAction SilentlyContinue
    
    if ($backendPort) {
        Stop-Process -Id $backendPort.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped backend server (port 4010)" -ForegroundColor Gray
    }
    
    if ($frontendPort) {
        Stop-Process -Id $frontendPort.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped frontend server (port 4011)" -ForegroundColor Gray
    }
    
    Write-Host "[OK] Servers stopped!" -ForegroundColor Green
}

function Check-Status {
    if (Test-Path "check-status.ps1") {
        & .\check-status.ps1
    } else {
        Write-Host ""
        Write-Host "Status check script not found. Running basic check..." -ForegroundColor Yellow
        Write-Host ""
        
        $backend = Get-NetTCPConnection -LocalPort 4010 -ErrorAction SilentlyContinue
        $frontend = Get-NetTCPConnection -LocalPort 4011 -ErrorAction SilentlyContinue
        
        Write-Host "Backend (port 4010):" -ForegroundColor Cyan
        if ($backend) {
            Write-Host "  [OK] Running" -ForegroundColor Green
        } else {
            Write-Host "  [X] Not running" -ForegroundColor Red
        }
        
        Write-Host "Frontend (port 4011):" -ForegroundColor Cyan
        if ($frontend) {
            Write-Host "  [OK] Running" -ForegroundColor Green
        } else {
            Write-Host "  [X] Not running" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "Test backend: http://localhost:4010/health" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Main command dispatcher
switch ($Command) {
    "dev" { Start-Dev }
    "install" { Install-Dependencies }
    "backend" { Start-Backend }
    "frontend" { Start-Frontend }
    "create-admin" { Create-Admin }
    "build" { Build-All }
    "clean" { Clean-Artifacts }
    "stop" { Stop-Servers }
    "status" { Check-Status }
    "help" { Show-Help }
    default { Show-Help }
}

