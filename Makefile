.PHONY: help install dev backend frontend create-admin clean build stop

# Default target
help:
	@echo "Admin Dashboard - Available Commands:"
	@echo ""
	@echo "  make install       - Install all dependencies (backend + frontend)"
	@echo "  make dev           - Start both backend and frontend servers"
	@echo "  make backend       - Start only backend server"
	@echo "  make frontend      - Start only frontend server"
	@echo "  make create-admin  - Create admin user (username: admin, password: password123)"
	@echo "  make build         - Build both backend and frontend for production"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make stop          - Stop all running servers"
	@echo ""

# Install all dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && go mod download
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✓ All dependencies installed!"

# Start both servers
dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:4010"
	@echo "Frontend: http://localhost:4011"
	@echo ""
	@echo "Press Ctrl+C to stop all servers"
	@echo ""
	@trap 'kill 0' EXIT; \
	cd backend && go run cmd/server/main.go & \
	cd frontend && npm run dev

# Start only backend
backend:
	@echo "Starting backend server on http://localhost:4010..."
	cd backend && go run cmd/server/main.go

# Start only frontend
frontend:
	@echo "Starting frontend server on http://localhost:4011..."
	cd frontend && npm run dev

# Create admin user
create-admin:
	@echo "Creating admin user..."
	cd backend && go run scripts/create_admin.go admin password123 "Admin User"
	@echo "✓ Admin user created!"
	@echo "Username: admin"
	@echo "Password: password123"

# Build for production
build:
	@echo "Building backend..."
	cd backend && go build -o server.exe cmd/server/main.go
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "✓ Build complete!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -f backend/server.exe
	rm -rf frontend/.next
	rm -rf frontend/node_modules/.cache
	@echo "✓ Clean complete!"

# Stop all servers (Unix/Linux/Mac)
stop:
	@echo "Stopping servers..."
	@pkill -f "go run cmd/server/main.go" || true
	@pkill -f "next dev" || true
	@echo "✓ Servers stopped!"

