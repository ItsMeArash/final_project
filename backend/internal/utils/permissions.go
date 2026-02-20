package utils

import (
	"admin-dashboard/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func UserHasPermission(db *gorm.DB, userID uuid.UUID, permissionName string) bool {
	var user models.User
	if err := db.Preload("Role.Permissions").Where("id = ?", userID).First(&user).Error; err != nil {
		return false
	}

	for _, perm := range user.Role.Permissions {
		if perm.Name == permissionName {
			return true
		}
	}

	return false
}

func GetUserPermissions(db *gorm.DB, userID uuid.UUID) ([]string, error) {
	var user models.User
	if err := db.Preload("Role.Permissions").Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, err
	}

	permissions := make([]string, len(user.Role.Permissions))
	for i, perm := range user.Role.Permissions {
		permissions[i] = perm.Name
	}

	return permissions, nil
}
