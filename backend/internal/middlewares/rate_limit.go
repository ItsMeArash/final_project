package middlewares

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
	rate     time.Duration
	burst    int
}

type visitor struct {
	lastSeen time.Time
	count    int
}

var limiter = &rateLimiter{
	visitors: make(map[string]*visitor),
	rate:     time.Minute,
	burst:    5,
}

func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter.mu.Lock()

		v, exists := limiter.visitors[ip]
		if !exists {
			v = &visitor{
				lastSeen: time.Now(),
				count:    1,
			}
			limiter.visitors[ip] = v
			limiter.mu.Unlock()
			c.Next()
			return
		}

		// Reset count if rate period has passed
		if time.Since(v.lastSeen) > limiter.rate {
			v.count = 1
			v.lastSeen = time.Now()
			limiter.mu.Unlock()
			c.Next()
			return
		}

		// Increment count
		v.count++
		v.lastSeen = time.Now()

		if v.count > limiter.burst {
			limiter.mu.Unlock()
			c.JSON(429, gin.H{"error": "Too many requests. Please try again later."})
			c.Abort()
			return
		}

		limiter.mu.Unlock()
		c.Next()
	}
}
