package handlers

import (
	"admin-dashboard/internal/database"
	"admin-dashboard/internal/models"
	"admin-dashboard/internal/services"
	"admin-dashboard/internal/utils"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var (
	captchaStore   *services.CaptchaStore
	usernameRegexp = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
)

func init() {
	captchaStore = services.NewCaptchaStore()
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=8"`
	FullName string `json:"full_name"`
}

type RegisterResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
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

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "error_code": "VALIDATION"})
		return
	}

	// Validate username format (letters, numbers, underscores, hyphens)
	if !usernameRegexp.MatchString(req.Username) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username can only contain letters, numbers, underscores and hyphens", "error_code": "USERNAME_INVALID"})
		return
	}

	// Check if username already exists
	var existingUser models.User
	if err := database.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists", "error_code": "USERNAME_TAKEN"})
		return
	}

	// Get default "viewer" role for self-registered users
	var viewerRole models.Role
	if err := database.DB.Where("name = ?", "viewer").First(&viewerRole).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration is not available", "error_code": "REGISTRATION_UNAVAILABLE"})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account", "error_code": "CREATE_FAILED"})
		return
	}

	// Use username as display name if full_name is empty
	fullName := req.FullName
	if fullName == "" {
		fullName = req.Username
	}

	user := models.User{
		ID:           uuid.New(),
		FullName:     fullName,
		Username:     req.Username,
		PasswordHash: hashedPassword,
		RoleID:       viewerRole.ID,
		IsActive:     true,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account", "error_code": "CREATE_FAILED"})
		return
	}

	// Load role for response
	database.DB.Preload("Role").First(&user, user.ID)
	user.PasswordHash = ""

	// Generate JWT token (auto-login after registration)
	token, err := utils.GenerateJWT(user.ID.String(), user.Username, user.RoleID.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Account created but login failed", "error_code": "LOGIN_AFTER_FAILED"})
		return
	}

	c.JSON(http.StatusCreated, RegisterResponse{
		Token: token,
		User:  user,
	})
}
