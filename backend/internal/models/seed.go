package models

import (
	"gorm.io/gorm"
)

func SeedRolesAndPermissions(db *gorm.DB) error {
	// Check if already seeded
	var roleCount int64
	db.Model(&Role{}).Count(&roleCount)
	if roleCount > 0 {
		return nil // Already seeded
	}

	// Create permissions
	permissions := []Permission{
		{Name: "USER_CREATE", Description: "Create new users"},
		{Name: "USER_READ", Description: "View users"},
		{Name: "USER_UPDATE", Description: "Update users"},
		{Name: "USER_DELETE", Description: "Delete/deactivate users"},
		{Name: "ROLE_MANAGE", Description: "Manage roles and permissions"},
		{Name: "ANALYTICS_VIEW", Description: "View analytics and reports"},
		{Name: "CHAT_SEND", Description: "Send chat messages"},
	}

	for _, perm := range permissions {
		if err := db.FirstOrCreate(&perm, Permission{Name: perm.Name}).Error; err != nil {
			return err
		}
	}

	// Create roles
	adminRole := Role{
		Name:        "admin",
		Description: "Full system access",
	}
	managerRole := Role{
		Name:        "manager",
		Description: "User and analytics management",
	}
	viewerRole := Role{
		Name:        "viewer",
		Description: "Read-only access",
	}

	if err := db.FirstOrCreate(&adminRole, Role{Name: "admin"}).Error; err != nil {
		return err
	}
	if err := db.FirstOrCreate(&managerRole, Role{Name: "manager"}).Error; err != nil {
		return err
	}
	if err := db.FirstOrCreate(&viewerRole, Role{Name: "viewer"}).Error; err != nil {
		return err
	}

	// Assign permissions to roles
	// Admin gets all permissions
	var allPerms []Permission
	db.Find(&allPerms)
	db.Model(&adminRole).Association("Permissions").Replace(allPerms)

	// Manager gets user management and analytics
	managerPerms := []Permission{}
	db.Where("name IN ?", []string{"USER_CREATE", "USER_READ", "USER_UPDATE", "ANALYTICS_VIEW", "CHAT_SEND"}).Find(&managerPerms)
	db.Model(&managerRole).Association("Permissions").Replace(managerPerms)

	// Viewer gets read-only
	viewerPerms := []Permission{}
	db.Where("name IN ?", []string{"USER_READ", "ANALYTICS_VIEW", "CHAT_SEND"}).Find(&viewerPerms)
	db.Model(&viewerRole).Association("Permissions").Replace(viewerPerms)

	return nil
}
