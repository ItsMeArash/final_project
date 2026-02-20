package database

import (
	"admin-dashboard/internal/config"
	"admin-dashboard/internal/models"
	"admin-dashboard/internal/utils"
	"fmt"
	"log"

	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() error {
	dsn := config.GetDBDSN()
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	DB = db
	log.Println("Database connected successfully")

	return nil
}

func Migrate() error {
	if DB == nil {
		return fmt.Errorf("database connection not initialized")
	}

	err := DB.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.Permission{},
		&models.RolePermission{},
		&models.ChatMessage{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}

func Seed() error {
	if DB == nil {
		return fmt.Errorf("database connection not initialized")
	}

	if err := models.SeedRolesAndPermissions(DB); err != nil {
		return err
	}

	// Seed default admin user (admin/admin) if none exists
	created, err := seedAdminUser(DB)
	if err != nil {
		return fmt.Errorf("failed to seed admin user: %w", err)
	}
	if created {
		log.Println("Default admin user created (admin/admin)")
	}
	return nil
}

func seedAdminUser(db *gorm.DB) (bool, error) {
	const adminUsername = "admin"
	var count int64
	db.Model(&models.User{}).Where("username = ?", adminUsername).Count(&count)
	if count > 0 {
		return false, nil
	}

	var adminRole models.Role
	if err := db.Where("name = ?", "admin").First(&adminRole).Error; err != nil {
		return false, err
	}

	hashedPassword, err := utils.HashPassword("admin")
	if err != nil {
		return false, err
	}

	adminUser := models.User{
		ID:           uuid.New(),
		FullName:     "System Admin",
		Username:     adminUsername,
		PasswordHash: hashedPassword,
		RoleID:       adminRole.ID,
		IsActive:     true,
	}
	if err := db.Create(&adminUser).Error; err != nil {
		return false, err
	}
	return true, nil
}
