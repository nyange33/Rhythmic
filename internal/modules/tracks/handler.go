package tracks

import (
	"errors"
	"net/http"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"

	"github.com/gin-gonic/gin"
)

type Service struct {
	tracks storage.TrackRepository
}

func NewService(tracks storage.TrackRepository) *Service {
	return &Service{tracks: tracks}
}

func RegisterRoutes(rg *gin.RouterGroup, svc *Service) {
	g := rg.Group("/tracks")
	g.GET("", func(c *gin.Context) { handleGetAllTracks(c, svc) })
	g.GET("/:id", func(c *gin.Context) { handleGetTrack(c, svc) })
	g.POST("", func(c *gin.Context) { handleCreateTrack(c, svc) })
	g.DELETE("/:id", func(c *gin.Context) { handleDeleteTrack(c, svc) })
	g.GET("/artist/:artist_id", func(c *gin.Context) { handleGetTracksByArtist(c, svc) })
}

func handleGetAllTracks(c *gin.Context, svc *Service) {
	tracks, err := svc.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get tracks"})
		return
	}
	c.JSON(http.StatusOK, tracks)
}

func handleGetTrack(c *gin.Context, svc *Service) {
	track, err := svc.GetByID(c.Param("id"))
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "track not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get track"})
		return
	}
	c.JSON(http.StatusOK, toView(track))
}

func handleCreateTrack(c *gin.Context, svc *Service) {
	var req CreateTrackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	track, err := svc.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create track"})
		return
	}
	c.JSON(http.StatusCreated, toView(track))
}

func handleDeleteTrack(c *gin.Context, svc *Service) {
	err := svc.Delete(c.Param("id"))
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "track not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete track"})
		return
	}
	c.Status(http.StatusNoContent)
}

func handleGetTracksByArtist(c *gin.Context, svc *Service) {
	tracks, err := svc.GetByArtistID(c.Param("artist_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get tracks"})
		return
	}
	c.JSON(http.StatusOK, tracks)
}

func (s *Service) GetAll() ([]TrackView, error) {
	tracks, err := s.tracks.GetAll()
	if err != nil {
		return nil, err
	}
	views := make([]TrackView, len(tracks))
	for i, track := range tracks {
		views[i] = toView(track)
	}
	return views, nil
}

func (s *Service) GetByID(id string) (TrackView, error) {
	track, err := s.tracks.GetByID(id)
	if err != nil {
		return TrackView{}, err
	}
	return toView(track), nil
}

func (s *Service) Create(req CreateTrackRequest) (TrackView, error) {
	track, err := s.tracks.Create(models.Track{
		Title:    req.Title,
		Artist:   req.Artist,
		Album:    req.Album,
		Duration: req.Duration,
		AudioURL: req.AudioURL,
		ArtistID: req.ArtistID,
	})
	if err != nil {
		return TrackView{}, err
	}
	return toView(track), nil
}

func (s *Service) Delete(id string) error {
	return s.tracks.Delete(id)
}

func (s *Service) GetByArtistID(artistID string) ([]TrackView, error) {
	tracks, err := s.tracks.GetByArtistID(artistID)
	if err != nil {
		return nil, err
	}
	views := make([]TrackView, len(tracks))
	for i, track := range tracks {
		views[i] = toView(track)
	}
	return views, nil
}

func toView(track models.Track) TrackView {
	return TrackView{
		ID:        track.ID,
		Title:     track.Title,
		Artist:    track.Artist,
		Album:     track.Album,
		Duration:  track.Duration,
		AudioURL:  track.AudioURL,
		ArtistID:  track.ArtistID,
		CreatedAt: track.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
