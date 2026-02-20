package handlers

import (
	"admin-dashboard/internal/database"
	"admin-dashboard/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetPermissions(c *gin.Context) {
	var permissions []models.Permission
	if err := database.DB.Find(&permissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch permissions"})
		return
	}

	c.JSON(http.StatusOK, permissions)
}
