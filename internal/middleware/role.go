package middleware

import (
	"net/http"

	"Rhythmic/internal/models"

	"github.com/gin-gonic/gin"
)

// RequireArtistRole middleware to check if user is an artist
func RequireArtistRole() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		userModel, ok := user.(models.User)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "invalid user data"})
			return
		}

		if userModel.Role != models.RoleArtist {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "artist role required"})
			return
		}

		c.Next()
	}
}

// RequireListenerRole middleware to check if user is a listener
func RequireListenerRole() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		userModel, ok := user.(models.User)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "invalid user data"})
			return
		}

		if userModel.Role != models.RoleListener {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "listener role required"})
			return
		}

		c.Next()
	}
}

