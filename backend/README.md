# Admin Dashboard Backend

This is the backend API for the Admin Dashboard system built with Go, Gin, PostgreSQL, and GORM.

## Features

- Multi-step authentication (Password + Captcha)
- JWT-based authentication
- Role-Based Access Control (RBAC)
- User management CRUD operations
- Analytics data generation
- Real-time chat via WebSocket
- PostgreSQL database with GORM

## Prerequisites

- Go 1.21 or higher
- PostgreSQL 12 or higher
- Make sure PostgreSQL is running

## Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE admin_dashboard;
```

2. Copy `.env.example` to `.env` and update `DB_PASSWORD`:

```bash
cp .env.example .env
# Edit .env and set your PostgreSQL password
```

3. Install dependencies:

```bash
go mod download
```

4. Run the server:

```bash
go run cmd/server/main.go
```

The server will start on `http://localhost:4010` (or the port specified in `PORT` env variable).

## API Endpoints

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| GET | /health | No | - | Health check |
| POST | /api/auth/login | No | - | Login (returns captcha challenge) |
| GET | /api/auth/captcha | No | - | Get captcha |
| POST | /api/auth/verify-captcha | No | - | Verify captcha, get JWT |
| GET | /api/me | Yes | - | Get current user |
| GET | /api/roles | Yes | - | List roles |
| GET | /api/roles/:id/permissions | Yes | - | Role permissions |
| POST | /api/roles/:id/permissions | Yes | ROLE_MANAGE | Assign permissions |
| GET | /api/permissions | Yes | - | List permissions |
| GET | /api/users | Yes | USER_READ | List users |
| GET | /api/users/:id | Yes | USER_READ | Get user |
| POST | /api/users | Yes | USER_CREATE | Create user |
| PUT | /api/users/:id | Yes | USER_UPDATE | Update user |
| DELETE | /api/users/:id | Yes | USER_DELETE | Deactivate user |
| GET | /api/analytics | Yes | ANALYTICS_VIEW | Analytics with filters |
| GET | /api/chat/history/:userId | Yes | CHAT_SEND | Chat history |
| WS | /ws/chat | Yes | - | WebSocket chat |

## Creating the First Admin User

After starting the server for the first time, you need to create an admin user. You can use the helper script:

```bash
go run scripts/create_admin.go <username> <password> <full_name>
```

Example:
```bash
go run scripts/create_admin.go admin password123 "Admin User"
```

Alternatively, you can create the user directly in the database (see the main README.md for SQL example).

## Database Schema

The database schema is automatically migrated using GORM AutoMigrate. Initial roles and permissions are seeded on startup.

### Roles
- `admin` - Full system access
- `manager` - User and analytics management
- `viewer` - Read-only access

### Permissions
- `USER_CREATE`, `USER_READ`, `USER_UPDATE`, `USER_DELETE`
- `ROLE_MANAGE`
- `ANALYTICS_VIEW`
- `CHAT_SEND`

## Project Structure

- `cmd/server/` - Application entry point
- `internal/config/` - Configuration management
- `internal/database/` - Database connection and migrations
- `internal/models/` - GORM models
- `internal/handlers/` - HTTP handlers
- `internal/middlewares/` - Middleware functions
- `internal/services/` - Business logic
- `internal/utils/` - Utility functions
- `internal/websocket/` - WebSocket hub and client management
