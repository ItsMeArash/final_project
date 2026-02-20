package middlewares

import (
	"admin-dashboard/internal/config"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	// Get allowed origins from config
	allowedOrigins := []string{config.AppConfig.CORSOrigin}
	
	// In development mode, allow common localhost variations
	if config.AppConfig.GinMode == "debug" {
		allowedOrigins = append(allowedOrigins,
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"http://localhost:3001",
			"http://127.0.0.1:3001",
			"http://localhost:4011",
			"http://127.0.0.1:4011",
		)
	}

	return cors.New(cors.Config{
		AllowOrigins: allowedOrigins,
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Content-Length",
			"Authorization",
			"Accept",
			"X-Requested-With",
			"Access-Control-Request-Method",
			"Access-Control-Request-Headers",
		},
		ExposeHeaders: []string{
			"Content-Length",
			"Content-Type",
			"Authorization",
		},
		AllowCredentials: true,
		MaxAge:           12 * 3600, // 12 hours - cache preflight for 12 hours
	})
}
