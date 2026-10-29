package auth

import (
	"errors"
	"net/http"
	"strings"

	"Rhythmic/internal/storage"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(rg *gin.RouterGroup, svc *Service) {
	g := rg.Group("/auth")
	g.POST("/register", func(c *gin.Context) { handleRegister(c, svc) })
	g.POST("/login", func(c *gin.Context) { handleLogin(c, svc) })
	g.GET("/me", func(c *gin.Context) { handleMe(c, svc) })
}

func RegisterUserRoutes(rg *gin.RouterGroup, svc *Service) {
	g := rg.Group("/users")
	g.Use(RequireAuth(svc))
	g.POST("", func(c *gin.Context) { handleCreateUser(c, svc) })
	g.PUT("/me", func(c *gin.Context) { handleUpdateProfile(c, svc) })
	g.DELETE("/:id", func(c *gin.Context) { handleDeleteUser(c, svc) })
}

func RequireAuth(svc *Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		token := strings.TrimPrefix(header, "Bearer ")
		if token == "" || token == header {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}
		user, err := svc.UserByToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set("userID", user.ID)
		c.Set("user", user)
		c.Next()
	}
}

func handleMe(c *gin.Context, svc *Service) {
	header := c.GetHeader("Authorization")
	token := strings.TrimPrefix(header, "Bearer ")
	if token == "" || token == header {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
		return
	}
	user, err := svc.UserByToken(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
		return
	}
	c.JSON(http.StatusOK, toView(user))
}

func handleRegister(c *gin.Context, svc *Service) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := svc.Register(req)
	if writeUserErr(c, err) {
		return
	}
	c.JSON(http.StatusCreated, resp)
}

func handleLogin(c *gin.Context, svc *Service) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := svc.Login(req)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "login failed"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func handleCreateUser(c *gin.Context, svc *Service) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, err := svc.CreateUser(req)
	if writeUserErr(c, err) {
		return
	}
	c.JSON(http.StatusCreated, user)
}

func handleUpdateProfile(c *gin.Context, svc *Service) {
	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing user session"})
		return
	}
	updated, err := svc.UpdateProfile(userID.(string), req.Username, req.Bio)
	if err != nil {
		if errors.Is(err, storage.ErrUsernameTaken) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updated)
}

func handleDeleteUser(c *gin.Context, svc *Service) {
	err := svc.DeleteUser(c.Param("id"))
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
	c.Status(http.StatusNoContent)
}

func writeUserErr(c *gin.Context, err error) bool {
	if err == nil {
		return false
	}
	switch {
	case errors.Is(err, storage.ErrEmailTaken), errors.Is(err, storage.ErrUsernameTaken):
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
	case errors.Is(err, ErrInvalidRole):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "request failed"})
	}
	return true
}
