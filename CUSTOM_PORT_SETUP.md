# Custom PostgreSQL Port Setup Guide

If your PostgreSQL is running on a non-standard port (not 5432), follow these steps.

## Quick Fix for Port 2580

### 1. Connect to PostgreSQL with Correct Port

Use the `-p` flag to specify the port:

**PowerShell:**
```powershell
psql -U postgres -d admin_dashboard -p 2580
```

**Or with full path:**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d admin_dashboard -p 2580
```

### 2. Update Backend .env File

Open `backend/.env` and change:

```env
# Change this line:
DB_PORT=5432

# To your actual port:
DB_PORT=2580
```

### 3. Create Database (if not created yet)

```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -p 2580 -c "CREATE DATABASE admin_dashboard;"
```

### 4. Verify Connection

```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d admin_dashboard -p 2580
```

You should see: `admin_dashboard=#`

## Complete Configuration Checklist

- [ ] PostgreSQL is running on port 2580
- [ ] Database `admin_dashboard` is created
- [ ] Backend `.env` has `DB_PORT=2580`
- [ ] Can connect with: `psql -U postgres -d admin_dashboard -p 2580`

## Setting Default Port (Optional)

If you want to avoid typing `-p 2580` every time, set the PGPORT environment variable:

**PowerShell (current session only):**
```powershell
$env:PGPORT = "2580"
psql -U postgres -d admin_dashboard
```

**PowerShell (permanent - add to profile):**
```powershell
[System.Environment]::SetEnvironmentVariable("PGPORT", "2580", "User")
```

**Windows (System-wide):**
1. Open System Properties → Environment Variables
2. Add new User variable: `PGPORT` = `2580`
3. Restart PowerShell

After setting PGPORT, you can use psql without `-p` flag:
```powershell
psql -U postgres -d admin_dashboard
```

## Testing Backend Connection

After updating `backend/.env` with `DB_PORT=2580`, test the connection:

```bash
cd backend
go run cmd/server/main.go
```

You should see:
```
Database connected successfully
```

If you see connection errors, double-check:
- PostgreSQL is running
- Port 2580 is correct
- DB_PASSWORD is correct
- Database `admin_dashboard` exists

## Common Commands for Port 2580

```powershell
# Connect to PostgreSQL
psql -U postgres -p 2580

# Create database
psql -U postgres -p 2580 -c "CREATE DATABASE admin_dashboard;"

# Connect to specific database
psql -U postgres -d admin_dashboard -p 2580

# List databases
psql -U postgres -p 2580 -c "\l"

# Check PostgreSQL version
psql -U postgres -p 2580 -c "SELECT version();"
```
