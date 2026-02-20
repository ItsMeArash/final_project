# PowerShell Commands Reference

This guide provides PowerShell-specific commands for PostgreSQL operations on Windows.

## Important: PowerShell Syntax

In PowerShell, when a path contains spaces, you **must** use the call operator `&` before quoted paths:

✅ **Correct:**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
```

❌ **Incorrect (causes error):**
```powershell
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
```

## Common PostgreSQL Commands in PowerShell

### 1. Connect to PostgreSQL

**Default port (5432):**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
```

**Custom port (e.g., 2580):**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -p 2580
```

### 2. Create Database (Non-Interactive)

**Default port:**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE admin_dashboard;"
```

**Custom port:**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -p 2580 -c "CREATE DATABASE admin_dashboard;"
```

### 3. Connect to Specific Database

**Default port:**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d admin_dashboard
```

**Custom port:**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d admin_dashboard -p 2580
```

### 4. List All Databases

```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "\l"
```

### 5. Drop Database (if needed)

```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "DROP DATABASE admin_dashboard;"
```

## Alternative: Add PostgreSQL to PATH

To avoid typing the full path every time:

### Temporary (Current Session Only)

```powershell
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
```

Then you can use:
```powershell
psql -U postgres
psql -U postgres -d admin_dashboard
```

### Permanent (System-wide)

1. **Open System Environment Variables:**
   - Press `Win + X` → System
   - Click "Advanced system settings"
   - Click "Environment Variables"

2. **Edit PATH:**
   - Under "System variables", find `Path`
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\PostgreSQL\15\bin`
   - Click OK on all dialogs

3. **Restart PowerShell** to apply changes

After this, you can use `psql` directly:
```powershell
psql -U postgres
```

## Alternative: Navigate to Bin Directory

```powershell
cd "C:\Program Files\PostgreSQL\15\bin"
.\psql.exe -U postgres
.\psql.exe -U postgres -d admin_dashboard
```

## Common PostgreSQL Operations

Once connected to PostgreSQL (`postgres=#` prompt):

### Create Database
```sql
CREATE DATABASE admin_dashboard;
```

### List Databases
```sql
\l
```

### Connect to Database
```sql
\c admin_dashboard
```

### List Tables (after connecting to database)
```sql
\dt
```

### Exit PostgreSQL
```sql
\q
```

## Password Prompts

When you run psql commands, you may be prompted for a password. Enter the password you set during PostgreSQL installation (default user is `postgres`).

**Tip:** If you're getting too many password prompts, you can set the password in an environment variable (less secure):

```powershell
$env:PGPASSWORD = "your_password"
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d admin_dashboard
```

## Complete Setup Example (PowerShell)

```powershell
# 1. Create database
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE admin_dashboard;"

# 2. Verify database exists
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "\l" | Select-String "admin_dashboard"

# 3. Connect to database (interactive session)
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d admin_dashboard
```

## Troubleshooting

### Error: "psql: error: connection to server failed"

**Solution:** Make sure PostgreSQL service is running:
```powershell
Get-Service postgresql*
```

If not running, start it:
```powershell
Start-Service postgresql-x64-15  # Adjust version number if different
```

### Error: "password authentication failed"

**Solution:** You entered wrong password. Try again or reset PostgreSQL password.

### Error: "database does not exist"

**Solution:** Create the database first using the CREATE DATABASE command above.

## Quick Reference Card

```powershell
# Connect
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres

# Create DB
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE admin_dashboard;"

# Connect to specific DB
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d admin_dashboard

# Check if running
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-15
```
