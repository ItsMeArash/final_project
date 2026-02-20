package handlers

import (
	"admin-dashboard/internal/config"
	"admin-dashboard/internal/database"
	"admin-dashboard/internal/models"
	ws "admin-dashboard/internal/websocket"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var (
	hub      *ws.Hub
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true // In production, check against allowed origins
		},
	}
)

func init() {
	hub = ws.NewHub()
	go hub.Run()
}

func HandleWebSocket(c *gin.Context) {
	// Get token from query parameter
	tokenStr := c.Query("token")
	if tokenStr == "" {
		// Try to get from header
		authHeader := c.GetHeader("Authorization")
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tokenStr = authHeader[7:]
		}
	}

	if tokenStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
		return
	}

	// Parse and validate token
	type Claims struct {
		UserID   string `json:"user_id"`
		Username string `json:"username"`
		RoleID   string `json:"role_id"`
		jwt.RegisteredClaims
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.AppConfig.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID in token"})
		return
	}

	// Get user details
	var user models.User
	if err := database.DB.Where("id = ? AND is_active = ?", userID, true).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found or inactive"})
		return
	}

	// Upgrade connection
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	// Create client
	client := &ws.Client{
		Hub:      hub,
		Conn:     conn,
		UserID:   userID,
		Username: user.Username,
		Send:     make(chan []byte, 256),
	}

	hub.Register(client)

	// Start goroutines
	go client.WritePump()
	go client.ReadPump()
}

func GetChatHistory(c *gin.Context) {
	otherUserIDStr := c.Param("userId")
	otherUserID, err := uuid.Parse(otherUserIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get current user ID from context
	currentUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	currentUserUUID, err := uuid.Parse(currentUserID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get messages between two users
	var messages []models.ChatMessage
	if err := database.DB.
		Preload("Sender").
		Preload("Receiver").
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			currentUserUUID, otherUserID, otherUserID, currentUserUUID).
		Order("created_at ASC").
		Limit(100).
		Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	c.JSON(http.StatusOK, messages)
}
