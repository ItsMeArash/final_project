package handlers

import (
	"admin-dashboard/internal/database"
	"admin-dashboard/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetRoles(c *gin.Context) {
	var roles []models.Role
	if err := database.DB.Find(&roles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch roles"})
		return
	}

	c.JSON(http.StatusOK, roles)
}

func GetRolePermissions(c *gin.Context) {
	id := c.Param("id")
	roleID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
		return
	}

	var role models.Role
	if err := database.DB.Preload("Permissions").Where("id = ?", roleID).First(&role).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"role":        role,
		"permissions": role.Permissions,
	})
}

type AssignPermissionsRequest struct {
	PermissionIDs []uuid.UUID `json:"permission_ids" binding:"required"`
}

func AssignRolePermissions(c *gin.Context) {
	id := c.Param("id")
	roleID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
		return
	}

	var req AssignPermissionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify role exists
	var role models.Role
	if err := database.DB.Where("id = ?", roleID).First(&role).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	// Verify all permissions exist
	var permissions []models.Permission
	if err := database.DB.Where("id IN ?", req.PermissionIDs).Find(&permissions).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "One or more permissions not found"})
		return
	}

	if len(permissions) != len(req.PermissionIDs) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "One or more permissions not found"})
		return
	}

	// Assign permissions to role
	if err := database.DB.Model(&role).Association("Permissions").Replace(permissions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign permissions"})
		return
	}

	// Load updated role with permissions
	database.DB.Preload("Permissions").First(&role, roleID)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Permissions assigned successfully",
		"role":        role,
		"permissions": role.Permissions,
	})
}
