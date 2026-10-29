package likes

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"
)

type Service struct {
	likeStore  storage.LikeRepository
	trackStore storage.TrackRepository
}

func NewService(likeStore storage.LikeRepository, trackStore storage.TrackRepository) *Service {
	return &Service{
		likeStore:  likeStore,
		trackStore: trackStore,
	}
}

func (s *Service) RegisterRoutes(r *gin.RouterGroup) {
	g := r.Group("/likes")
	{
		g.POST("", s.createLike)
		g.GET("", s.getLikes)
		g.GET("/check", s.checkLike)
		g.DELETE("/:id", s.deleteLike)
		g.DELETE("/track/:track_id", s.deleteLikeByUserAndTrack)
	}
}

func (s *Service) createLike(c *gin.Context) {
	var req CreateLikeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if already liked
	liked, err := s.likeStore.IsLiked(req.UserID, req.TrackID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check like status"})
		return
	}
	if liked {
		c.JSON(http.StatusConflict, gin.H{"error": "Already liked"})
		return
	}

	like := models.Like{
		UserID:  req.UserID,
		TrackID: req.TrackID,
	}

	created, err := s.likeStore.Create(like)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create like"})
		return
	}

	// Increment likes count on track
	if err := s.trackStore.IncrementLikesCount(req.TrackID); err != nil {
		// Log error but don't fail the request
	}

	c.JSON(http.StatusCreated, toView(created))
}

func (s *Service) getLikes(c *gin.Context) {
	userID := c.Query("user_id")
	trackID := c.Query("track_id")

	if userID != "" {
		likes, err := s.likeStore.GetByUserID(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get likes"})
			return
		}

		views := make([]LikeView, 0, len(likes))
		for _, like := range likes {
			views = append(views, toView(like))
		}
		c.JSON(http.StatusOK, views)
		return
	}

	if trackID != "" {
		likes, err := s.likeStore.GetByTrackID(trackID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get likes"})
			return
		}

		views := make([]LikeView, 0, len(likes))
		for _, like := range likes {
			views = append(views, toView(like))
		}
		c.JSON(http.StatusOK, views)
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "user_id or track_id query parameter required"})
}

func (s *Service) checkLike(c *gin.Context) {
	userID := c.Query("user_id")
	trackID := c.Query("track_id")

	if userID == "" || trackID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id and track_id query parameters required"})
		return
	}

	liked, err := s.likeStore.IsLiked(userID, trackID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check like status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"liked": liked})
}

func (s *Service) deleteLike(c *gin.Context) {
	id := c.Param("id")

	if err := s.likeStore.Delete(id); err != nil {
		if err == storage.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Like not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete like"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func (s *Service) deleteLikeByUserAndTrack(c *gin.Context) {
	userID := c.Query("user_id")
	trackID := c.Param("track_id")

	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id query parameter required"})
		return
	}

	if err := s.likeStore.DeleteByUserAndTrack(userID, trackID); err != nil {
		if err == storage.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Like not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete like"})
		return
	}

	// Decrement likes count on track
	if err := s.trackStore.DecrementLikesCount(trackID); err != nil {
		// Log error but don't fail the request
	}

	c.JSON(http.StatusNoContent, nil)
}
