# Quick Status Check Script
# Usage: .\check-status.ps1

Write-Host ""
Write-Host "=== Admin Dashboard Status Check ===" -ForegroundColor Cyan
Write-Host ""

# Check Backend
Write-Host "Backend Status:" -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 4010 -ErrorAction SilentlyContinue
if ($backend) {
    Write-Host "  [OK] Backend is running on port 4010" -ForegroundColor Green
    Write-Host "    PID: $($backend.OwningProcess)" -ForegroundColor Gray
} else {
    Write-Host "  [X] Backend is NOT running on port 4010" -ForegroundColor Red
    Write-Host "    Start with: .\dev.ps1 backend" -ForegroundColor Yellow
    Write-Host "    Or: cd backend; go run cmd/server/main.go" -ForegroundColor Yellow
}

# Check Frontend
Write-Host ""
Write-Host "Frontend Status:" -ForegroundColor Yellow
$frontend = Get-NetTCPConnection -LocalPort 4011 -ErrorAction SilentlyContinue
if ($frontend) {
    Write-Host "  [OK] Frontend is running on port 4011" -ForegroundColor Green
    Write-Host "    PID: $($frontend.OwningProcess)" -ForegroundColor Gray
} else {
    Write-Host "  [X] Frontend is NOT running on port 4011" -ForegroundColor Red
    Write-Host "    Start with: .\dev.ps1 frontend" -ForegroundColor Yellow
    Write-Host "    Or: cd frontend; npm run dev" -ForegroundColor Yellow
}

# Test Backend Health
Write-Host ""
Write-Host "Backend Health Check:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4010/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  [OK] Backend is responding" -ForegroundColor Green
    Write-Host "    Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "  [X] Backend is not responding" -ForegroundColor Red
    if ($backend) {
        Write-Host "    Port is open but health check failed" -ForegroundColor Yellow
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    } else {
        Write-Host "    Backend server is not running" -ForegroundColor Yellow
    }
}

# Check Environment Files
Write-Host ""
Write-Host "Configuration Files:" -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "  [OK] backend/.env exists" -ForegroundColor Green
} else {
    Write-Host "  [X] backend/.env is missing" -ForegroundColor Red
    Write-Host "    Copy from backend/.env.example" -ForegroundColor Yellow
}

if (Test-Path "frontend\.env.local") {
    Write-Host "  [OK] frontend/.env.local exists" -ForegroundColor Green
} else {
    Write-Host "  [X] frontend/.env.local is missing" -ForegroundColor Red
    Write-Host "    Copy from frontend/.env.example" -ForegroundColor Yellow
}

# Check Database (optional - requires psql)
Write-Host ""
Write-Host "Database Connection:" -ForegroundColor Yellow
$psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
$dbPort = 5432
if (Test-Path "backend\.env") {
    $envContent = Get-Content "backend\.env" -Raw -ErrorAction SilentlyContinue
    if ($envContent -match "DB_PORT=(\d+)") { $dbPort = $Matches[1] }
}
if (Test-Path $psqlPath) {
    try {
        $env:PGPASSWORD = "postgres"  # Adjust if needed
        $result = & $psqlPath -U postgres -p $dbPort -d admin_dashboard -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Database connection successful" -ForegroundColor Green
        } else {
            Write-Host "  [X] Database connection failed" -ForegroundColor Red
            Write-Host "    Check your database credentials in backend/.env" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ? Could not test database connection" -ForegroundColor Yellow
        Write-Host "    (This is optional - check manually if needed)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ? psql not found in default location" -ForegroundColor Yellow
    Write-Host "    (Database check skipped)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
if ($backend -and $frontend) {
    Write-Host "[OK] Both servers are running!" -ForegroundColor Green
    Write-Host "  Backend: http://localhost:4010" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:4011" -ForegroundColor Cyan
} else {
    Write-Host "[X] Some servers are not running" -ForegroundColor Red
    Write-Host "  Run: .\dev.ps1 dev" -ForegroundColor Yellow
}
Write-Host ""

