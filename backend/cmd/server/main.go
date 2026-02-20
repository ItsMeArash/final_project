package main

import (
	"admin-dashboard/internal/config"
	"admin-dashboard/internal/database"
	"admin-dashboard/internal/handlers"
	"admin-dashboard/internal/middlewares"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Set Gin mode
	gin.SetMode(config.AppConfig.GinMode)

	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := database.Migrate(); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Seed initial data
	if err := database.Seed(); err != nil {
		log.Fatal("Failed to seed database:", err)
	}

	// Initialize router
	r := gin.Default()

	// Middleware
	r.Use(middlewares.CORSMiddleware())
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API routes
	api := r.Group("/api")
	{
		// Auth routes (no auth required)
		auth := api.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/register", handlers.Register)
			auth.GET("/captcha", handlers.GetCaptcha)
			auth.POST("/verify-captcha", handlers.VerifyCaptcha)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middlewares.AuthMiddleware())
		{
			// Current user
			protected.GET("/me", handlers.GetCurrentUser)

			// Roles and Permissions
			// Roles and Permissions
			roles := protected.Group("/roles")
			{
				roles.GET("", handlers.GetRoles)
				roles.GET("/:id/permissions", handlers.GetRolePermissions)
				roles.POST("/:id/permissions", middlewares.RequirePermission("ROLE_MANAGE"), handlers.AssignRolePermissions)
			}

			permissions := protected.Group("/permissions")
			{
				permissions.GET("", handlers.GetPermissions)
			}

			// Users
			users := protected.Group("/users")
			users.Use(middlewares.RequirePermission("USER_READ"))
			{
				users.GET("", handlers.GetUsers)
				users.GET("/:id", handlers.GetUser)
				users.POST("", middlewares.RequirePermission("USER_CREATE"), handlers.CreateUser)
				users.PUT("/:id", middlewares.RequirePermission("USER_UPDATE"), handlers.UpdateUser)
				users.DELETE("/:id", middlewares.RequirePermission("USER_DELETE"), handlers.DeleteUser)
			}

			// Analytics
			analytics := protected.Group("/analytics")
			analytics.Use(middlewares.RequirePermission("ANALYTICS_VIEW"))
			{
				analytics.GET("", handlers.GetAnalytics)
			}

			// Chat
			chat := protected.Group("/chat")
			chat.Use(middlewares.RequirePermission("CHAT_SEND"))
			{
				chat.GET("/history/:userId", handlers.GetChatHistory)
			}
		}

		// WebSocket route
		r.GET("/ws/chat", handlers.HandleWebSocket)
	}

	// Start server
	port := config.AppConfig.Port
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
