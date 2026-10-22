package storage

import "Rhythmic/internal/models"

type AlbumRepository interface {
	Create(album models.Album) (models.Album, error)
	GetByID(id string) (models.Album, error)
	GetByArtistID(artistID string) ([]models.Album, error)
	GetAll() ([]models.Album, error)
	Update(id string, album models.Album) (models.Album, error)
	Delete(id string) error
	AddTrack(albumID, trackID string) error
	RemoveTrack(albumID, trackID string) error
}
