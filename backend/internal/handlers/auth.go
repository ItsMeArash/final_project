package handlers

import (
	"admin-dashboard/internal/database"
	"admin-dashboard/internal/models"
	"admin-dashboard/internal/services"
	"admin-dashboard/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

var (
	captchaStore *services.CaptchaStore
)

func init() {
	captchaStore = services.NewCaptchaStore()
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Message         string `json:"message"`
	RequiresCaptcha bool   `json:"requires_captcha"`
	CaptchaID       string `json:"captcha_id,omitempty"`
	CaptchaQuestion string `json:"captcha_question,omitempty"`
}

type VerifyCaptchaRequest struct {
	Username  string `json:"username" binding:"required"`
	CaptchaID string `json:"captcha_id" binding:"required"`
	Answer    string `json:"answer" binding:"required"`
}

type VerifyCaptchaResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by username
	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check if user is active
	if !user.IsActive {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User account is inactive"})
		return
	}

	// Verify password
	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate captcha challenge
	captcha := captchaStore.Generate()

	c.JSON(http.StatusOK, LoginResponse{
		Message:         "Credentials verified. Please solve the captcha.",
		RequiresCaptcha: true,
		CaptchaID:       captcha.ID,
		CaptchaQuestion: captcha.Question,
	})
}

func GetCaptcha(c *gin.Context) {
	captcha := captchaStore.Generate()
	c.JSON(http.StatusOK, gin.H{
		"id":       captcha.ID,
		"question": captcha.Question,
	})
}

func VerifyCaptcha(c *gin.Context) {
	var req VerifyCaptchaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate input
	if req.CaptchaID == "" || req.Answer == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Captcha ID and answer are required"})
		return
	}

	// Verify captcha first
	if captchaStore == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Captcha service unavailable"})
		return
	}

	if !captchaStore.Verify(req.CaptchaID, req.Answer) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid captcha. Please try again."})
		return
	}

	// Verify user exists and is active
	var user models.User
	if err := database.DB.Preload("Role").Where("username = ? AND is_active = ?", req.Username, true).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found or inactive"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID.String(), user.Username, user.RoleID.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Clear password hash from response
	user.PasswordHash = ""

	c.JSON(http.StatusOK, VerifyCaptchaResponse{
		Token: token,
		User:  user,
	})
}
