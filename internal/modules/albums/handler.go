package albums

import (
	"errors"
	"net/http"
	"time"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"

	"github.com/gin-gonic/gin"
)

type Service struct {
	albums storage.AlbumRepository
}

func NewService(albums storage.AlbumRepository) *Service {
	return &Service{albums: albums}
}

func RegisterRoutes(rg *gin.RouterGroup, svc *Service) {
	g := rg.Group("/albums")
	g.GET("", func(c *gin.Context) { handleGetAllAlbums(c, svc) })
	g.GET("/artist/:artist_id", func(c *gin.Context) { handleGetAlbumsByArtist(c, svc) })
	g.GET("/:id", func(c *gin.Context) { handleGetAlbum(c, svc) })
	g.POST("", func(c *gin.Context) { handleCreateAlbum(c, svc) })
	g.PUT("/:id", func(c *gin.Context) { handleUpdateAlbum(c, svc) })
	g.DELETE("/:id", func(c *gin.Context) { handleDeleteAlbum(c, svc) })
	g.POST("/:id/tracks", func(c *gin.Context) { handleAddTrack(c, svc) })
	g.DELETE("/:id/tracks/:track_id", func(c *gin.Context) { handleRemoveTrack(c, svc) })
}

func handleGetAllAlbums(c *gin.Context, svc *Service) {
	albums, err := svc.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get albums"})
		return
	}
	c.JSON(http.StatusOK, albums)
}

func handleGetAlbum(c *gin.Context, svc *Service) {
	album, err := svc.GetByID(c.Param("id"))
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "album not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get album"})
		return
	}
	c.JSON(http.StatusOK, toView(album))
}

func handleGetAlbumsByArtist(c *gin.Context, svc *Service) {
	albums, err := svc.GetByArtistID(c.Param("artist_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get albums"})
		return
	}
	c.JSON(http.StatusOK, albums)
}

func handleCreateAlbum(c *gin.Context, svc *Service) {
	var req CreateAlbumRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	releaseDate, err := time.Parse(time.RFC3339, req.ReleaseDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid release_date format"})
		return
	}

	album, err := svc.Create(req, releaseDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create album"})
		return
	}
	c.JSON(http.StatusCreated, toView(album))
}

func handleUpdateAlbum(c *gin.Context, svc *Service) {
	var req UpdateAlbumRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	album, err := svc.Update(c.Param("id"), req)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "album not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update album"})
		return
	}
	c.JSON(http.StatusOK, toView(album))
}

func handleDeleteAlbum(c *gin.Context, svc *Service) {
	err := svc.Delete(c.Param("id"))
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "album not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete album"})
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
			c.JSON(http.StatusNotFound, gin.H{"error": "album not found"})
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
			c.JSON(http.StatusNotFound, gin.H{"error": "album not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove track"})
		return
	}
	c.Status(http.StatusNoContent)
}

func (s *Service) GetAll() ([]AlbumView, error) {
	albums, err := s.albums.GetAll()
	if err != nil {
		return nil, err
	}
	views := make([]AlbumView, len(albums))
	for i, album := range albums {
		views[i] = toView(album)
	}
	return views, nil
}

func (s *Service) GetByID(id string) (AlbumView, error) {
	album, err := s.albums.GetByID(id)
	if err != nil {
		return AlbumView{}, err
	}
	return toView(album), nil
}

func (s *Service) GetByArtistID(artistID string) ([]AlbumView, error) {
	albums, err := s.albums.GetByArtistID(artistID)
	if err != nil {
		return nil, err
	}
	views := make([]AlbumView, len(albums))
	for i, album := range albums {
		views[i] = toView(album)
	}
	return views, nil
}

func (s *Service) Create(req CreateAlbumRequest, releaseDate time.Time) (AlbumView, error) {
	album, err := s.albums.Create(models.Album{
		Title:       req.Title,
		ArtistID:    req.ArtistID,
		ArtistName:  req.ArtistName,
		CoverURL:    req.CoverURL,
		ReleaseDate: releaseDate,
		Genre:       req.Genre,
		TrackIDs:    req.TrackIDs,
	})
	if err != nil {
		return AlbumView{}, err
	}
	return toView(album), nil
}

func (s *Service) Update(id string, req UpdateAlbumRequest) (AlbumView, error) {
	existing, err := s.albums.GetByID(id)
	if err != nil {
		return AlbumView{}, err
	}

	updated := existing
	if req.Title != "" {
		updated.Title = req.Title
	}
	if req.CoverURL != "" {
		updated.CoverURL = req.CoverURL
	}
	if req.ReleaseDate != "" {
		releaseDate, err := time.Parse(time.RFC3339, req.ReleaseDate)
		if err == nil {
			updated.ReleaseDate = releaseDate
		}
	}
	if req.Genre != "" {
		updated.Genre = req.Genre
	}

	album, err := s.albums.Update(id, updated)
	if err != nil {
		return AlbumView{}, err
	}
	return toView(album), nil
}

func (s *Service) Delete(id string) error {
	return s.albums.Delete(id)
}

func (s *Service) AddTrack(albumID, trackID string) error {
	return s.albums.AddTrack(albumID, trackID)
}

func (s *Service) RemoveTrack(albumID, trackID string) error {
	return s.albums.RemoveTrack(albumID, trackID)
}

func toView(album models.Album) AlbumView {
	return AlbumView{
		ID:          album.ID,
		Title:       album.Title,
		ArtistID:    album.ArtistID,
		ArtistName:  album.ArtistName,
		CoverURL:    album.CoverURL,
		ReleaseDate: album.ReleaseDate.Format("2006-01-02T15:04:05Z07:00"),
		Genre:       album.Genre,
		TrackIDs:    album.TrackIDs,
		CreatedAt:   album.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   album.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
