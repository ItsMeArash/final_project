# Detailed Setup Instructions

This guide provides step-by-step instructions for setting up the PostgreSQL database, backend environment, and frontend environment.

## Table of Contents
1. [PostgreSQL Database Setup](#1-postgresql-database-setup)
2. [Backend Environment Setup](#2-backend-environment-setup)
3. [Frontend Environment Setup](#3-frontend-environment-setup)
4. [Creating the First Admin User](#4-creating-the-first-admin-user)
5. [Running the Application](#5-running-the-application)

---

## 1. PostgreSQL Database Setup

### Option A: Installing PostgreSQL (If Not Installed)

#### Windows
1. **Download PostgreSQL:**
   - Visit https://www.postgresql.org/download/windows/
   - Download the PostgreSQL installer (e.g., PostgreSQL 15.x or 16.x)
   - Run the installer

2. **Installation Steps:**
   - Choose installation directory (default: `C:\Program Files\PostgreSQL\15`)
   - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Set data directory (default: `C:\Program Files\PostgreSQL\15\data`)
   - Set password for the `postgres` superuser (remember this password!)
   - Set port (default: `5432`)
   - Choose locale (default: `[Default locale]`)
   - Complete the installation

3. **Verify Installation:**
   - Open PowerShell (as Administrator if needed)
   - **Option A: Using call operator (Recommended for PowerShell):**
     ```powershell
     & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
     ```
   - **Option B: Navigate to bin directory first:**
     ```powershell
     cd "C:\Program Files\PostgreSQL\15\bin"
     .\psql.exe -U postgres
     ```
   - **Option C: Add PostgreSQL to PATH** (for easier access):
     ```powershell
     # Add to PATH (run once)
     $env:Path += ";C:\Program Files\PostgreSQL\15\bin"
     # Then you can use:
     psql -U postgres
     ```
   - Enter your password when prompted
   - You should see: `postgres=#`

#### macOS
1. **Using Homebrew (Recommended):**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Or Download Installer:**
   - Visit https://www.postgresql.org/download/macosx/
   - Download and install the .dmg file
   - Follow the installation wizard

3. **Verify Installation:**
   ```bash
   psql -U postgres
   ```

#### Linux (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo -u postgres psql
```

### Option B: Using Docker (Alternative)

If you prefer using Docker:

```bash
# Run PostgreSQL in Docker container
docker run --name admin-dashboard-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=admin_dashboard \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

### Creating the Database

#### Method 1: Using psql Command Line

1. **Open PostgreSQL command line:**
   
   **Windows PowerShell (default port 5432):**
   ```powershell
   # Use call operator (&) when path has spaces
   & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
   ```
   
   **Windows PowerShell (custom port, e.g., 2580):**
   ```powershell
   & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -p 2580
   ```
   
   **Windows Command Prompt (CMD):**
   ```cmd
   "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -p 2580
   ```
   
   **Or if PostgreSQL is in PATH:**
   ```powershell
   psql -U postgres -p 2580
   ```
   
   **macOS/Linux:**
   ```bash
   psql -U postgres -p 2580
   ```

2. **Enter your PostgreSQL password when prompted**

3. **Create the database:**
   ```sql
   CREATE DATABASE admin_dashboard;
   ```

4. **Verify database creation:**
   ```sql
   \l
   ```
   You should see `admin_dashboard` in the list.

5. **Exit psql:**
   ```sql
   \q
   ```

#### Method 2: Using pgAdmin (GUI Tool)

1. **Open pgAdmin 4** (installed with PostgreSQL)

2. **Connect to PostgreSQL server:**
   - Right-click on "Servers" → "Create" → "Server"
   - General tab: Name it "Local PostgreSQL"
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: (your PostgreSQL password)
   - Click "Save"

3. **Create the database:**
   - Expand "Servers" → "Local PostgreSQL" → "Databases"
   - Right-click on "Databases" → "Create" → "Database"
   - Database name: `admin_dashboard`
   - Owner: `postgres`
   - Click "Save"

#### Method 3: Using SQL Command (No Interactive Session)

**Windows PowerShell (default port):**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE admin_dashboard;"
```

**Windows PowerShell (custom port, e.g., 2580):**
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -p 2580 -c "CREATE DATABASE admin_dashboard;"
```

**Windows Command Prompt (CMD):**
```cmd
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -p 2580 -c "CREATE DATABASE admin_dashboard;"
```

**macOS/Linux:**
```bash
psql -U postgres -p 2580 -c "CREATE DATABASE admin_dashboard;"
```

### Verify Database Connection

Test if you can connect to the database:

**Windows PowerShell:**
```powershell
# Default port (5432)
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d admin_dashboard

# Custom port (e.g., 2580)
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d admin_dashboard -p 2580
```

**Windows Command Prompt (CMD):**
```cmd
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d admin_dashboard -p 2580
```

**macOS/Linux:**
```bash
# Default port
psql -U postgres -d admin_dashboard

# Custom port
psql -U postgres -d admin_dashboard -p 2580
```

If you see `admin_dashboard=#`, the connection is successful!

**Note:** If your PostgreSQL uses a non-standard port, always include `-p <port_number>` in your psql commands.

**Note for PowerShell Users:**
- Use `&` call operator before quoted paths with spaces
- Or navigate to the bin directory first: `cd "C:\Program Files\PostgreSQL\15\bin"` then `.\psql.exe -U postgres`

---

## 2. Backend Environment Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create .env File

Copy the example file to create your `.env`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

**Or manually create** `backend/.env` file using your text editor (use `backend/.env.example` as reference).

### Step 3: Configure Backend .env File

Open `backend/.env` and add the following content:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=4010
GIN_MODE=debug

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Database host (localhost for local development)
DB_HOST=localhost

# PostgreSQL port (default is 5432, change if your PostgreSQL uses a different port)
DB_PORT=5432

# Database user (default is 'postgres')
DB_USER=postgres

# Database password (the password you set during PostgreSQL installation)
DB_PASSWORD=postgres

# Database name (the one we created earlier)
DB_NAME=admin_dashboard

# SSL mode (disable for local development, enable for production)
DB_SSLMODE=disable

# ============================================
# JWT CONFIGURATION
# ============================================
# IMPORTANT: Change this to a random secure string in production!
# Generate a secure secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters

# JWT token expiration time in hours
JWT_EXPIRATION_HOURS=24

# ============================================
# CORS CONFIGURATION
# ============================================
# Frontend URL (Next.js default development port)
CORS_ORIGIN=http://localhost:4011

```

### Step 4: Update Database Credentials

**IMPORTANT:** Update these values according to your PostgreSQL setup:

1. **DB_PASSWORD**: Replace `postgres` with your actual PostgreSQL password
2. **DB_USER**: Change only if you created a different database user
3. **DB_NAME**: Should be `admin_dashboard` (unless you named it differently)
4. **DB_PORT**: Change from `5432` to your actual PostgreSQL port (e.g., `2580`)

### Step 5: Generate a Secure JWT Secret (Recommended)

For production or better security, generate a random JWT secret:

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})))
```

**macOS/Linux:**
```bash
openssl rand -base64 32
```

Replace `JWT_SECRET` value in `.env` with the generated string.

### Step 6: Verify Backend .env File

Your `backend/.env` file should look like this (with your actual values):

```env
PORT=4010
GIN_MODE=debug
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_actual_password_here
DB_NAME=admin_dashboard
DB_SSLMODE=disable
JWT_SECRET=your-generated-secret-key-here
JWT_EXPIRATION_HOURS=24
CORS_ORIGIN=http://localhost:4011
```

### Common Backend .env Issues

**Issue 1: Database Connection Failed**
- Check if PostgreSQL is running
- Verify DB_PASSWORD is correct
- Verify DB_NAME exists in PostgreSQL
- **Check DB_PORT matches your PostgreSQL port** (if using custom port like 2580, update this!)
- Check DB_HOST is correct

**Issue 2: Permission Denied**
- Make sure DB_USER has permissions on the database
- Try using `postgres` superuser for development

---

## 3. Frontend Environment Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Create .env.local File

Copy the example file to create your `.env.local`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

**macOS/Linux:**
```bash
cp .env.example .env.local
```

**Or manually create** `frontend/.env.local` file using your text editor (use `frontend/.env.example` as reference).

### Step 3: Configure Frontend .env.local File

Open `frontend/.env.local` and add the following content:

```env
# ============================================
# API CONFIGURATION
# ============================================
# Backend API base URL (matches backend PORT)
NEXT_PUBLIC_API_URL=http://localhost:4010/api

# ============================================
# WEBSOCKET CONFIGURATION
# ============================================
# WebSocket URL for real-time chat
NEXT_PUBLIC_WS_URL=ws://localhost:4010/ws/chat
```

### Step 4: Verify Frontend .env.local File

Your `frontend/.env.local` file should look exactly like this:

```env
NEXT_PUBLIC_API_URL=http://localhost:4010/api
NEXT_PUBLIC_WS_URL=ws://localhost:4010/ws/chat
```

**Important Notes:**
- These URLs must match your backend configuration
- If you changed the backend `PORT` in backend `.env`, update `NEXT_PUBLIC_API_URL` accordingly
- `NEXT_PUBLIC_` prefix is required for Next.js environment variables accessible in the browser
- Use `ws://` for local development, `wss://` for production (HTTPS)

### Step 5: Port Matching

Make sure the ports are configured correctly:

| Configuration | Port | Notes |
|--------------|------|-------|
| Frontend Dev Server | `4011` | Next.js runs on this port (configured in `package.json`) |
| Backend Server | `4010` (or `PORT` in `.env`) | Backend API runs on this port |
| `CORS_ORIGIN` | `http://localhost:4011` | Must match frontend URL |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4010/api` | Must point to backend port |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:4010/ws/chat` | Must point to backend port |

**Note:** Frontend and backend can run on different ports. Frontend (4011) makes API calls to backend (4010).

---

## 4. Creating the First Admin User

After setting up the database and environment files, you need to create the first admin user.

### Step 1: Start the Backend Server First

This will create the database tables and seed initial roles:

```bash
cd backend
go mod download  # Only needed first time
go run cmd/server/main.go
```

You should see:
```
Database connected successfully
Database migrations completed successfully
Database migrations completed successfully
Server starting on port 4010
```

### Step 2: Create Admin User Using Script

**Open a new terminal window** (keep backend running) and run:

```bash
cd backend
go run scripts/create_admin.go admin password123 "Admin User"
```

**Parameters:**
- `admin` - Username for the admin user
- `password123` - Password (use a strong password!)
- `Admin User` - Full name

**Example with different values:**
```bash
go run scripts/create_admin.go myadmin SecurePass123! "Administrator"
```

You should see:
```
Admin user created successfully!
Username: admin
Full Name: Admin User
Role: admin
```

### Alternative: Create Admin User Manually in Database

If the script doesn't work, you can create the user directly:

1. **Connect to PostgreSQL:**
   ```bash
   psql -U postgres -d admin_dashboard
   ```

2. **Get admin role ID:**
   ```sql
   SELECT id FROM roles WHERE name = 'admin';
   ```
   Copy the UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

3. **Generate password hash:**
   - Use an online bcrypt generator: https://bcrypt-generator.com/
   - Or use Go code:
     ```bash
     go run -c 'package main; import ("fmt"; "golang.org/x/crypto/bcrypt"); func main() { hash, _ := bcrypt.GenerateFromPassword([]byte("yourpassword"), 10); fmt.Println(string(hash)) }'
     ```

4. **Insert admin user:**
   ```sql
   INSERT INTO users (id, full_name, username, password_hash, is_active, role_id, created_at, updated_at)
   VALUES (
     gen_random_uuid(),
     'Admin User',
     'admin',
     '$2a$10$YourHashedPasswordHere',  -- Replace with actual hash
     true,
     'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- Replace with actual role ID
     NOW(),
     NOW()
   );
   ```

---

## 5. Running the Application

### Start Backend

**Terminal 1:**
```bash
cd backend
go run cmd/server/main.go
```

You should see:
```
Database connected successfully
Database migrations completed successfully
Server starting on port 4010
```

### Start Frontend

**Terminal 2:**
```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

You should see:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:4011
  - Ready in 2.5s
```

### Access the Application

1. **Open browser:** http://localhost:4011
2. **You'll be redirected to:** http://localhost:4011/auth/login
3. **Login with:**
   - Username: `admin` (or the username you created)
   - Password: `password123` (or the password you set)
   - Follow the multi-step authentication process

---

## Troubleshooting

### Database Connection Issues

**Error: "connection refused" or "dial tcp"**
- Check if PostgreSQL is running:
  ```bash
  # Windows
  Get-Service postgresql*
  
  # macOS/Linux
  sudo systemctl status postgresql
  ```
- Verify PostgreSQL port: `netstat -an | findstr 5432` (Windows) or `lsof -i :5432` (macOS/Linux)

**Error: "password authentication failed"**
- Double-check `DB_PASSWORD` in `backend/.env`
- Try resetting PostgreSQL password:
  ```sql
  ALTER USER postgres PASSWORD 'newpassword';
  ```

**Error: "database does not exist"**
- Create the database (see section 1)
- Verify `DB_NAME` in `backend/.env`

### Backend Issues

**Error: "module not found"**
```bash
cd backend
go mod download
go mod tidy
```

**Error: "port already in use"**
- Change `PORT` in `backend/.env` to a different port (e.g., `8081`)
- Update `CORS_ORIGIN` and frontend `.env.local` accordingly

### Frontend Issues

**Error: "Cannot connect to API"**
- Verify backend is running on `http://localhost:4010`
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Make sure CORS is configured correctly in backend

**Environment variables not loading**
- Restart Next.js dev server after changing `.env.local`
- Make sure variable names start with `NEXT_PUBLIC_`
- Clear Next.js cache: `rm -rf .next` (macOS/Linux) or `Remove-Item -Recurse -Force .next` (Windows)

### WebSocket Issues

**Error: "WebSocket connection failed"**
- Verify backend WebSocket endpoint is accessible
- Check `NEXT_PUBLIC_WS_URL` in `frontend/.env.local`
- Make sure backend is running

---

## Quick Reference Checklist

Before running the application, verify:

- [ ] PostgreSQL is installed and running
- [ ] Database `admin_dashboard` is created
- [ ] `backend/.env` file exists with correct database credentials
- [ ] `frontend/.env.local` file exists with correct API URLs
- [ ] Backend starts without errors
- [ ] At least one admin user is created
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:4011

---

## Next Steps

Once everything is set up:
1. Login with your admin credentials
2. Explore the dashboard
3. Create additional users from the Users page
4. Test the analytics dashboard
5. Try real-time chat functionality

For production deployment, remember to:
- Use strong JWT secrets
- Enable SSL for database (`DB_SSLMODE=require`)
- Configure proper CORS origins
- Use `wss://` for WebSocket in production
