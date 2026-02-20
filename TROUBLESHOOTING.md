# Troubleshooting Guide

## ERR_CONNECTION_REFUSED Error

This error means the frontend cannot connect to the backend server. Follow these steps:

### Step 1: Verify Backend Server is Running

**Check if backend is running:**
```powershell
# Windows PowerShell
Get-NetTCPConnection -LocalPort 4010 -ErrorAction SilentlyContinue

# Or check processes
Get-Process | Where-Object { $_.ProcessName -eq "go" }
```

**Expected output:** Should show a process listening on port 4010

**If not running, start it:**
```powershell
cd backend
go run cmd/server/main.go
```

You should see:
```
Server starting on port 4010
Database connected successfully
```

### Step 2: Test Backend Health Endpoint

Open a browser or use PowerShell to test:
```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:4010/health" -Method GET

# Or in browser, visit:
# http://localhost:4010/health
```

**Expected response:**
```json
{"status":"ok"}
```

### Step 3: Check Backend Configuration

Verify `backend/.env` file exists and has correct settings (copy from `backend/.env.example`):
```env
PORT=4010
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=admin_dashboard
CORS_ORIGIN=http://localhost:4011
```
Note: `DB_PORT` defaults to 5432; change if your PostgreSQL uses a different port.

### Step 4: Check Database Connection

The backend must connect to PostgreSQL. Check backend logs for:
- `Failed to connect to database` - Database connection issue
- `Failed to migrate database` - Migration issue
- `Failed to seed database` - Seeding issue

**Test database connection:**
```powershell
# Default port 5432 (use -p <port> if your PostgreSQL uses a different port)
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d admin_dashboard
```

### Step 5: Check Frontend Configuration

Verify `frontend/.env.local` file exists:
```env
NEXT_PUBLIC_API_URL=http://localhost:4010/api
NEXT_PUBLIC_WS_URL=ws://localhost:4010/ws/chat
```

**Important:** After changing `.env.local`, restart the frontend server!

### Step 6: Check Firewall/Antivirus

Windows Firewall or antivirus might be blocking the connection:
- Check Windows Firewall settings
- Temporarily disable antivirus to test
- Ensure ports 4010 and 4011 are not blocked

### Step 7: Verify Ports Are Not in Use

**Check if ports are already in use:**
```powershell
# Check port 4010 (backend)
Get-NetTCPConnection -LocalPort 4010 -ErrorAction SilentlyContinue

# Check port 4011 (frontend)
Get-NetTCPConnection -LocalPort 4011 -ErrorAction SilentlyContinue
```

**If ports are in use by another process:**
```powershell
# Find and kill process on port 4010
$connection = Get-NetTCPConnection -LocalPort 4010 -ErrorAction SilentlyContinue
if ($connection) {
    Stop-Process -Id $connection.OwningProcess -Force
}
```

## Common Issues

### Issue: Backend starts but immediately crashes

**Solution:**
1. Check database is running
2. Verify `.env` file has correct database credentials
3. Check backend logs for specific error messages

### Issue: Frontend shows connection refused on page load

**Solution:**
1. Make sure backend is running first
2. Wait a few seconds after starting backend
3. Check browser console for exact error URL
4. Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Issue: CORS errors

**Solution:**
1. Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL
2. Should be: `CORS_ORIGIN=http://localhost:4011`
3. Restart backend after changing `.env`

### Issue: Database connection fails

**Solution:**
1. Verify PostgreSQL is running
2. Check `DB_PORT` in `backend/.env` matches your PostgreSQL port (default: 5432)
3. Verify username and password are correct
4. Ensure database `admin_dashboard` exists

## Quick Diagnostic Script

Run this in PowerShell from project root:

```powershell
Write-Host "=== Backend Status ===" -ForegroundColor Cyan
$backend = Get-NetTCPConnection -LocalPort 4010 -ErrorAction SilentlyContinue
if ($backend) {
    Write-Host "✓ Backend is running on port 4010" -ForegroundColor Green
} else {
    Write-Host "✗ Backend is NOT running on port 4010" -ForegroundColor Red
    Write-Host "  Start it with: cd backend && go run cmd/server/main.go" -ForegroundColor Yellow
}

Write-Host "`n=== Frontend Status ===" -ForegroundColor Cyan
$frontend = Get-NetTCPConnection -LocalPort 4011 -ErrorAction SilentlyContinue
if ($frontend) {
    Write-Host "✓ Frontend is running on port 4011" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend is NOT running on port 4011" -ForegroundColor Red
    Write-Host "  Start it with: cd frontend && npm run dev" -ForegroundColor Yellow
}

Write-Host "`n=== Backend Health Check ===" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4010/health" -Method GET -TimeoutSec 2
    Write-Host "✓ Backend health check passed" -ForegroundColor Green
    Write-Host "  Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend health check failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n=== Environment Files ===" -ForegroundColor Cyan
if (Test-Path "backend\.env") {
    Write-Host "✓ backend/.env exists" -ForegroundColor Green
} else {
    Write-Host "✗ backend/.env is missing" -ForegroundColor Red
}

if (Test-Path "frontend\.env.local") {
    Write-Host "✓ frontend/.env.local exists" -ForegroundColor Green
} else {
    Write-Host "✗ frontend/.env.local is missing" -ForegroundColor Red
}
```

## Still Having Issues?

1. Check backend terminal for error messages
2. Check browser console (F12) for detailed error messages
3. Verify all prerequisites are installed (Go, Node.js, PostgreSQL)
4. Try restarting both servers
5. Clear browser cache and localStorage

