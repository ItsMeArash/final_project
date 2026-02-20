package handlers

import (
	"admin-dashboard/internal/database"
	"admin-dashboard/internal/models"
	"admin-dashboard/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCurrentUser(c *gin.Context) {
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	user := userInterface.(*models.User)

	// Get user permissions
	permissions, err := utils.GetUserPermissions(database.DB, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch permissions"})
		return
	}

	// Load role
	if err := database.DB.Preload("Role").Preload("Role.Permissions").First(user, user.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	user.PasswordHash = ""

	c.JSON(http.StatusOK, gin.H{
		"user":        user,
		"permissions": permissions,
	})
}
