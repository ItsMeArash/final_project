# Modular Admin Dashboard System

A comprehensive admin dashboard with multi-step authentication, RBAC, data visualization, and real-time chat. Backend: Go (Gin) + PostgreSQL. Frontend: Next.js + React + TypeScript.

## How to Start

**Prerequisites:** Go 1.21+, Node.js 18+, PostgreSQL 12+

**Returning to the project?**
```powershell
# Windows
.\dev.ps1 dev
```
```bash
# Linux/Mac/WSL
make dev
```

**First time setup?**
1. Create database: `CREATE DATABASE admin_dashboard;` (in psql)
2. Copy env files: `backend/.env.example` → `backend/.env`, `frontend/.env.example` → `frontend/.env.local`
3. Update `DB_PASSWORD` in `backend/.env` to your PostgreSQL password
4. Run `.\dev.ps1 install` (or `make install`)
5. Run `.\dev.ps1 create-admin` (or `make create-admin`)
6. Run `.\dev.ps1 dev` (or `make dev`)

**URLs:** Backend http://localhost:4010 | Frontend http://localhost:4011

**Default credentials:** `admin` / `password123`

For detailed first-time setup, see [SETUP.md](SETUP.md).

## Tech Stack

| Backend | Frontend |
|---------|----------|
| Go 1.21+, Gin, PostgreSQL, GORM | Next.js 14, React 18, TypeScript |
| JWT, WebSocket (gorilla/websocket) | Tailwind, Zustand, TanStack Query |
| - | Highcharts, Axios |

## Features

- Multi-step Authentication (Password + Captcha)
- User Management (Admin-created users only)
- Full RBAC (Role-Based Access Control)
- Data Visualization with Highcharts
- Real-time Chat via WebSocket
- JWT-based Authentication
- Protected Routes & Role-based UI

## Project Structure

```
.
├── backend/
│   ├── cmd/server/        # Application entry point
│   ├── internal/
│   │   ├── config/        # Configuration
│   │   ├── database/      # Database connection
│   │   ├── handlers/      # HTTP handlers
│   │   ├── middlewares/   # Middleware functions
│   │   ├── models/        # GORM models
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities
│   │   └── websocket/     # WebSocket hub
│   └── go.mod
├── frontend/
│   ├── app/               # Next.js App Router pages
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── stores/        # Zustand stores
│   │   └── utils/         # Utilities
│   └── package.json
└── README.md
```

## Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](SETUP.md) | First-time setup (PostgreSQL, env, create-admin) |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues (ERR_CONNECTION_REFUSED, etc.) |
| [backend/README.md](backend/README.md) | API reference, backend setup |
| [frontend/README.md](frontend/README.md) | Frontend routes, services, setup |

## Dev Commands

| Command | Windows | Linux/Mac |
|---------|---------|-----------|
| Start both | `.\dev.ps1 dev` | `make dev` |
| Install deps | `.\dev.ps1 install` | `make install` |
| Create admin | `.\dev.ps1 create-admin` | `make create-admin` |
| Backend only | `.\dev.ps1 backend` | `make backend` |
| Frontend only | `.\dev.ps1 frontend` | `make frontend` |
| Status check | `.\dev.ps1 status` | - |

## Default Roles

- **Admin** – Full system access
- **Manager** – User management, analytics, chat
- **Viewer** – User read, analytics, chat

## Security

- JWT tokens expire after configured hours
- Passwords hashed with bcrypt
- RBAC on backend and frontend
- CORS configured for frontend origin
- Rate limiting on auth endpoints

## License

This project is for demonstration purposes.
