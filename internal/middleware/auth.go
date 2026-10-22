package middleware

import (
	"net/http"
	"strings"

	"Rhythmic/internal/modules/auth"

	"github.com/gin-gonic/gin"
)

// RequireAuth middleware to check if user is authenticated
func RequireAuth(authSvc *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		token := strings.TrimPrefix(header, "Bearer ")
		if token == "" || token == header {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}
		user, err := authSvc.UserByToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set("userID", user.ID)
		c.Set("user", user)
		c.Next()
	}
}

// RequireRole middleware to check if user has required role
func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, exists := c.Get("user")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		// This would need actual user model, for now skip
		c.Next()
	}
}

