package follows

import (
	"errors"
	"net/http"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"

	"github.com/gin-gonic/gin"
)

type Service struct {
	follows storage.FollowRepository
	artists storage.ArtistRepository
}

func NewService(follows storage.FollowRepository, artists storage.ArtistRepository) *Service {
	return &Service{follows: follows, artists: artists}
}

func RegisterRoutes(rg *gin.RouterGroup, svc *Service) {
	g := rg.Group("/follows")
	g.GET("", func(c *gin.Context) { handleGetUserFollows(c, svc) })
	g.GET("/artist/:artist_id", func(c *gin.Context) { handleGetArtistFollowers(c, svc) })
	g.GET("/check", func(c *gin.Context) { handleCheckFollow(c, svc) })
	g.POST("", func(c *gin.Context) { handleCreateFollow(c, svc) })
	g.DELETE("/:id", func(c *gin.Context) { handleDeleteFollow(c, svc) })
	g.DELETE("/user/:user_id/artist/:artist_id", func(c *gin.Context) { handleUnfollow(c, svc) })
}

func handleGetUserFollows(c *gin.Context, svc *Service) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}
	follows, err := svc.GetByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get follows"})
		return
	}
	c.JSON(http.StatusOK, follows)
}

func handleGetArtistFollowers(c *gin.Context, svc *Service) {
	follows, err := svc.GetByArtistID(c.Param("artist_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get followers"})
		return
	}
	c.JSON(http.StatusOK, follows)
}

func handleCheckFollow(c *gin.Context, svc *Service) {
	userID := c.Query("user_id")
	artistID := c.Query("artist_id")
	if userID == "" || artistID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id and artist_id are required"})
		return
	}
	isFollowing, err := svc.IsFollowing(userID, artistID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check follow"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"is_following": isFollowing})
}

func handleCreateFollow(c *gin.Context, svc *Service) {
	var req CreateFollowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	follow, err := svc.Create(req)
	if err != nil {
		if errors.Is(err, storage.ErrEmailTaken) {
			c.JSON(http.StatusConflict, gin.H{"error": "already following"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create follow"})
		return
	}
	c.JSON(http.StatusCreated, follow)
}

func handleDeleteFollow(c *gin.Context, svc *Service) {
	err := svc.Delete(c.Param("id"))
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "follow not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete follow"})
		return
	}
	c.Status(http.StatusNoContent)
}

func handleUnfollow(c *gin.Context, svc *Service) {
	err := svc.DeleteByUserAndArtist(c.Param("user_id"), c.Param("artist_id"))
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "follow not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unfollow"})
		return
	}
	c.Status(http.StatusNoContent)
}

func (s *Service) GetByUserID(userID string) ([]FollowView, error) {
	follows, err := s.follows.GetByUserID(userID)
	if err != nil {
		return nil, err
	}
	views := make([]FollowView, len(follows))
	for i, follow := range follows {
		views[i] = toView(follow)
	}
	return views, nil
}

func (s *Service) GetByArtistID(artistID string) ([]FollowView, error) {
	follows, err := s.follows.GetByArtistID(artistID)
	if err != nil {
		return nil, err
	}
	views := make([]FollowView, len(follows))
	for i, follow := range follows {
		views[i] = toView(follow)
	}
	return views, nil
}

func (s *Service) IsFollowing(userID, artistID string) (bool, error) {
	return s.follows.IsFollowing(userID, artistID)
}

func (s *Service) Create(req CreateFollowRequest) (FollowView, error) {
	follow, err := s.follows.Create(models.Follow{
		UserID:   req.UserID,
		ArtistID: req.ArtistID,
	})
	if err != nil {
		return FollowView{}, err
	}

	// Increment artist followers count (log error but don't fail)
	if err := s.artists.IncrementFollowers(req.ArtistID); err != nil {
		// Log error in production, for now just continue
	}

	return toView(follow), nil
}

func (s *Service) Delete(id string) error {
	follow, err := s.follows.GetByID(id)
	if err != nil {
		return err
	}

	err = s.follows.Delete(id)
	if err != nil {
		return err
	}

	// Decrement artist followers count (log error but don't fail)
	if err := s.artists.DecrementFollowers(follow.ArtistID); err != nil {
		// Log error in production, for now just continue
	}

	return nil
}

func (s *Service) DeleteByUserAndArtist(userID, artistID string) error {
	err := s.follows.DeleteByUserAndArtist(userID, artistID)
	if err != nil {
		return err
	}

	// Decrement artist followers count (log error but don't fail)
	if err := s.artists.DecrementFollowers(artistID); err != nil {
		// Log error in production, for now just continue
	}

	return nil
}

func toView(follow models.Follow) FollowView {
	return FollowView{
		ID:        follow.ID,
		UserID:    follow.UserID,
		ArtistID:  follow.ArtistID,
		CreatedAt: follow.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
