package playlists

import (
	"errors"
	"net/http"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"

	"github.com/gin-gonic/gin"
)

type Service struct {
	playlists storage.PlaylistRepository
}

func NewService(playlists storage.PlaylistRepository) *Service {
	return &Service{playlists: playlists}
}

func RegisterRoutes(rg *gin.RouterGroup, svc *Service) {
	g := rg.Group("/playlists")
	g.GET("", func(c *gin.Context) { handleGetUserPlaylists(c, svc) })
	g.POST("", func(c *gin.Context) { handleCreatePlaylist(c, svc) })
	g.GET("/:id", func(c *gin.Context) { handleGetPlaylist(c, svc) })
	g.PUT("/:id", func(c *gin.Context) { handleUpdatePlaylist(c, svc) })
	g.DELETE("/:id", func(c *gin.Context) { handleDeletePlaylist(c, svc) })
	g.POST("/:id/tracks", func(c *gin.Context) { handleAddTrack(c, svc) })
	g.DELETE("/:id/tracks/:track_id", func(c *gin.Context) { handleRemoveTrack(c, svc) })
}

func handleGetUserPlaylists(c *gin.Context, svc *Service) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}
	playlists, err := svc.GetByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get playlists"})
		return
	}
	c.JSON(http.StatusOK, playlists)
}

func handleGetPlaylist(c *gin.Context, svc *Service) {
	playlist, err := svc.GetByID(c.Param("id"))
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "playlist not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get playlist"})
		return
	}
	c.JSON(http.StatusOK, toView(playlist))
}

func handleCreatePlaylist(c *gin.Context, svc *Service) {
	var req CreatePlaylistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}
	playlist, err := svc.Create(req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create playlist"})
		return
	}
	c.JSON(http.StatusCreated, toView(playlist))
}

func handleUpdatePlaylist(c *gin.Context, svc *Service) {
	var req UpdatePlaylistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	playlist, err := svc.Update(c.Param("id"), req)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "playlist not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update playlist"})
		return
	}
	c.JSON(http.StatusOK, toView(playlist))
}

func handleDeletePlaylist(c *gin.Context, svc *Service) {
	err := svc.Delete(c.Param("id"))
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "playlist not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete playlist"})
		return
	}
	c.Status(http.StatusNoContent)
}

func handleAddTrack(c *gin.Context, svc *Service) {
	var req AddTrackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err := svc.AddTrack(c.Param("id"), req.TrackID)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "playlist not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add track"})
		return
	}
	c.Status(http.StatusNoContent)
}

func handleRemoveTrack(c *gin.Context, svc *Service) {
	err := svc.RemoveTrack(c.Param("id"), c.Param("track_id"))
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "playlist not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove track"})
		return
	}
	c.Status(http.StatusNoContent)
}

func (s *Service) GetByUserID(userID string) ([]PlaylistView, error) {
	playlists, err := s.playlists.GetByUserID(userID)
	if err != nil {
		return nil, err
	}
	views := make([]PlaylistView, len(playlists))
	for i, playlist := range playlists {
		views[i] = toView(playlist)
	}
	return views, nil
}

func (s *Service) GetByID(id string) (PlaylistView, error) {
	playlist, err := s.playlists.GetByID(id)
	if err != nil {
		return PlaylistView{}, err
	}
	return toView(playlist), nil
}

func (s *Service) Create(req CreatePlaylistRequest, userID string) (PlaylistView, error) {
	playlist, err := s.playlists.Create(models.Playlist{
		Name:        req.Name,
		Description: req.Description,
		UserID:      userID,
		TrackIDs:    req.TrackIDs,
		CoverURL:    req.CoverURL,
		IsPublic:    req.IsPublic,
	})
	if err != nil {
		return PlaylistView{}, err
	}
	return toView(playlist), nil
}

func (s *Service) Update(id string, req UpdatePlaylistRequest) (PlaylistView, error) {
	existing, err := s.playlists.GetByID(id)
	if err != nil {
		return PlaylistView{}, err
	}

	updated := existing
	if req.Name != "" {
		updated.Name = req.Name
	}
	if req.Description != "" {
		updated.Description = req.Description
	}
	if req.CoverURL != "" {
		updated.CoverURL = req.CoverURL
	}
	if req.IsPublic != nil {
		updated.IsPublic = *req.IsPublic
	}

	playlist, err := s.playlists.Update(id, updated)
	if err != nil {
		return PlaylistView{}, err
	}
	return toView(playlist), nil
}

func (s *Service) Delete(id string) error {
	return s.playlists.Delete(id)
}

func (s *Service) AddTrack(playlistID, trackID string) error {
	return s.playlists.AddTrack(playlistID, trackID)
}

func (s *Service) RemoveTrack(playlistID, trackID string) error {
	return s.playlists.RemoveTrack(playlistID, trackID)
}

func toView(playlist models.Playlist) PlaylistView {
	return PlaylistView{
		ID:          playlist.ID,
		Name:        playlist.Name,
		Description: playlist.Description,
		UserID:      playlist.UserID,
		TrackIDs:    playlist.TrackIDs,
		CoverURL:    playlist.CoverURL,
		IsPublic:    playlist.IsPublic,
		CreatedAt:   playlist.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   playlist.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
