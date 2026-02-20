package main

import (
	"admin-dashboard/internal/config"
	"admin-dashboard/internal/database"
	"admin-dashboard/internal/models"
	"admin-dashboard/internal/utils"
	"fmt"
	"log"
	"os"

	"github.com/google/uuid"
)

func main() {
	if len(os.Args) < 4 {
		fmt.Println("Usage: go run scripts/create_admin.go <username> <password> <full_name>")
		fmt.Println("Example: go run scripts/create_admin.go admin password123 'Admin User'")
		os.Exit(1)
	}

	username := os.Args[1]
	password := os.Args[2]
	fullName := os.Args[3]

	// Load config
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Seed roles and permissions
	if err := database.Seed(); err != nil {
		log.Fatal("Failed to seed database:", err)
	}

	// Get admin role
	var adminRole models.Role
	if err := database.DB.Where("name = ?", "admin").First(&adminRole).Error; err != nil {
		log.Fatal("Admin role not found. Make sure database is seeded.")
	}

	// Check if user already exists
	var existingUser models.User
	if err := database.DB.Where("username = ?", username).First(&existingUser).Error; err == nil {
		log.Fatal("User with this username already exists")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	// Create admin user
	adminUser := models.User{
		ID:           uuid.New(),
		FullName:     fullName,
		Username:     username,
		PasswordHash: hashedPassword,
		RoleID:       adminRole.ID,
		IsActive:     true,
	}

	if err := database.DB.Create(&adminUser).Error; err != nil {
		log.Fatal("Failed to create admin user:", err)
	}

	fmt.Printf("Admin user created successfully!\n")
	fmt.Printf("Username: %s\n", username)
	fmt.Printf("Full Name: %s\n", fullName)
	fmt.Printf("Role: admin\n")
}
