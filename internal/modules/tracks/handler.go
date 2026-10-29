package tracks

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"Rhythmic/internal/middleware"
	"Rhythmic/internal/models"
	"Rhythmic/internal/modules/auth"
	"Rhythmic/internal/storage"
	"Rhythmic/internal/utils"

	"github.com/gin-gonic/gin"
)

type Service struct {
	tracks storage.TrackRepository
}

func NewService(tracks storage.TrackRepository) *Service {
	return &Service{tracks: tracks}
}

func RegisterRoutes(rg *gin.RouterGroup, svc *Service, authSvc *auth.Service) {
	g := rg.Group("/tracks")
	g.GET("", func(c *gin.Context) { handleGetAllTracks(c, svc) })
	g.GET("/search", func(c *gin.Context) { handleSearchTracks(c, svc) })
	g.GET("/genre/:genre", func(c *gin.Context) { handleGetTracksByGenre(c, svc) })
	g.GET("/popular", func(c *gin.Context) { handleGetPopularTracks(c, svc) })
	g.GET("/artist/:artist_id", func(c *gin.Context) { handleGetTracksByArtist(c, svc) })
	g.GET("/:id", func(c *gin.Context) { handleGetTrack(c, svc) })
	protected := rg.Group("/tracks")
	protected.Use(auth.RequireAuth(authSvc), middleware.RequireArtistRole())
	protected.POST("", func(c *gin.Context) { handleCreateTrack(c, svc) })
	protected.POST("/upload", func(c *gin.Context) { handleUploadAudio(c, svc) })
	protected.POST("/upload-cover", func(c *gin.Context) { handleUploadCover(c) })
	g.PUT("/:id", func(c *gin.Context) { handleUpdateTrack(c, svc) })
	g.DELETE("/:id", func(c *gin.Context) { handleDeleteTrack(c, svc) })
	g.POST("/:id/listen", func(c *gin.Context) { handleIncrementListenCount(c, svc) })
}

func handleGetAllTracks(c *gin.Context, svc *Service) {
	tracks, err := svc.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get tracks"})
		return
	}
	c.JSON(http.StatusOK, tracks)
}

func handleSearchTracks(c *gin.Context, svc *Service) {
	query := c.Query("q")
	tracks, err := svc.Search(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to search tracks"})
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
	c.JSON(http.StatusOK, track)
}

func handleCreateTrack(c *gin.Context, svc *Service) {
	var req CreateTrackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userValue, exists := c.Get("user")
	user, ok := userValue.(models.User)
	if !exists || !ok || user.Role != models.RoleArtist {
		c.JSON(http.StatusForbidden, gin.H{"error": "artist account required"})
		return
	}
	req.ArtistID = user.ID
	req.Artist = user.Username
	track, err := svc.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create track"})
		return
	}
	c.JSON(http.StatusCreated, track)
}

func handleUploadAudio(c *gin.Context, svc *Service) {
	file, err := c.FormFile("audio")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no audio file provided"})
		return
	}

	// Validate file type
	if !utils.ValidateAudioFile(file.Filename) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid audio format"})
		return
	}

	if file.Size > 100<<20 {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "audio file exceeds 100 MB"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open file"})
		return
	}
	defer src.Close()

	inputData, err := io.ReadAll(src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read file"})
		return
	}

	format := utils.GetAudioFormat(file.Filename)
	converted := inputData
	if format != "mp3" {
		converted, err = utils.NewAudioConverter().ConvertToMP3FromBytes(inputData, format)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "audio conversion failed; install ffmpeg or upload an MP3 file"})
			return
		}
	}

	root := "."
	if _, statErr := os.Stat(filepath.Join(root, "public")); os.IsNotExist(statErr) {
		root = filepath.Join("..", "..")
	}
	fileName := randomHex(12) + ".mp3"
	outputPath := filepath.Join(root, "public", "uploads", "tracks", fileName)
	if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create upload directory"})
		return
	}
	if err := os.WriteFile(outputPath, converted, 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save audio file"})
		return
	}

	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	audioURL := fmt.Sprintf("%s://%s/uploads/tracks/%s", scheme, c.Request.Host, fileName)
	c.JSON(http.StatusOK, UploadAudioResponse{AudioURL: audioURL, Duration: 0})
}

func handleUploadCover(c *gin.Context) {
	file, err := c.FormFile("cover")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no cover image provided"})
		return
	}
	if file.Size > 5<<20 {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "cover image exceeds 5 MB"})
		return
	}
	extension := filepath.Ext(file.Filename)
	switch strings.ToLower(extension) {
	case ".jpg", ".jpeg", ".png", ".webp", ".gif":
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "cover must be JPG, PNG, WEBP or GIF"})
		return
	}
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open cover"})
		return
	}
	defer src.Close()
	data, err := io.ReadAll(src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read cover"})
		return
	}
	root := "."
	if _, statErr := os.Stat(filepath.Join(root, "public")); os.IsNotExist(statErr) {
		root = filepath.Join("..", "..")
	}
	fileName := randomHex(12) + strings.ToLower(extension)
	outputPath := filepath.Join(root, "public", "uploads", "covers", fileName)
	if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create cover directory"})
		return
	}
	if err := os.WriteFile(outputPath, data, 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save cover"})
		return
	}
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	c.JSON(http.StatusOK, gin.H{"cover_url": fmt.Sprintf("%s://%s/uploads/covers/%s", scheme, c.Request.Host, fileName)})
}

func handleUpdateTrack(c *gin.Context, svc *Service) {
	var req UpdateTrackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	track, err := svc.Update(c.Param("id"), req)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "track not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update track"})
		return
	}
	c.JSON(http.StatusOK, track)
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

func handleGetTracksByGenre(c *gin.Context, svc *Service) {
	tracks, err := svc.GetByGenre(c.Param("genre"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get tracks"})
		return
	}
	c.JSON(http.StatusOK, tracks)
}

func handleGetPopularTracks(c *gin.Context, svc *Service) {
	limit := 10
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := fmt.Sscanf(limitStr, "%d", &limit); err == nil && l == 1 {
			if limit > 50 {
				limit = 50
			}
		}
	}

	tracks, err := svc.GetPopular(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get popular tracks"})
		return
	}
	c.JSON(http.StatusOK, tracks)
}

func handleIncrementListenCount(c *gin.Context, svc *Service) {
	err := svc.IncrementListenCount(c.Param("id"))
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "track not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to increment listen count"})
		return
	}
	c.Status(http.StatusNoContent)
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

func (s *Service) Search(query string) ([]TrackView, error) {
	tracks, err := s.tracks.Search(query)
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
		Genre:    req.Genre,
		Duration: req.Duration,
		AudioURL: req.AudioURL,
		CoverURL: req.CoverURL,
		ArtistID: req.ArtistID,
	})
	if err != nil {
		return TrackView{}, err
	}
	return toView(track), nil
}

func (s *Service) Update(id string, req UpdateTrackRequest) (TrackView, error) {
	existing, err := s.tracks.GetByID(id)
	if err != nil {
		return TrackView{}, err
	}

	updated := existing
	if req.Title != "" {
		updated.Title = req.Title
	}
	if req.Artist != "" {
		updated.Artist = req.Artist
	}
	if req.Album != "" {
		updated.Album = req.Album
	}
	if req.Genre != "" {
		updated.Genre = req.Genre
	}
	if req.Duration > 0 {
		updated.Duration = req.Duration
	}
	if req.AudioURL != "" {
		updated.AudioURL = req.AudioURL
	}
	if req.CoverURL != "" {
		updated.CoverURL = req.CoverURL
	}
	if req.ArtistID != "" {
		updated.ArtistID = req.ArtistID
	}

	track, err := s.tracks.Update(id, updated)
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

func (s *Service) GetByGenre(genre string) ([]TrackView, error) {
	tracks, err := s.tracks.GetByGenre(genre)
	if err != nil {
		return nil, err
	}
	views := make([]TrackView, len(tracks))
	for i, track := range tracks {
		views[i] = toView(track)
	}
	return views, nil
}

func (s *Service) GetPopular(limit int) ([]TrackView, error) {
	tracks, err := s.tracks.GetPopular(limit)
	if err != nil {
		return nil, err
	}
	views := make([]TrackView, len(tracks))
	for i, track := range tracks {
		views[i] = toView(track)
	}
	return views, nil
}

func (s *Service) IncrementListenCount(id string) error {
	return s.tracks.IncrementListenCount(id)
}

func toView(track models.Track) TrackView {
	return TrackView{
		ID:          track.ID,
		Title:       track.Title,
		Artist:      track.Artist,
		Album:       track.Album,
		Genre:       track.Genre,
		Duration:    track.Duration,
		AudioURL:    track.AudioURL,
		CoverURL:    track.CoverURL,
		ArtistID:    track.ArtistID,
		ListenCount: track.ListenCount,
		LikesCount:  track.LikesCount,
		CreatedAt:   track.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func randomHex(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b)
}
