package storage

import "Rhythmic/internal/models"

type TrackRepository interface {
	Create(track models.Track) (models.Track, error)
	GetByID(id string) (models.Track, error)
	GetAll() ([]models.Track, error)
	GetByArtistID(artistID string) ([]models.Track, error)
	Update(id string, track models.Track) (models.Track, error)
	Delete(id string) error
}
