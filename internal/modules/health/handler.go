package health

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func RegisterRoutes(r *gin.Engine, svc *Service) {
	r.GET("/health", func(c *gin.Context) { handleHealth(c, svc) })
}

func handleHealth(c *gin.Context, svc *Service) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"service": "rhythmic-api",
	})
}
