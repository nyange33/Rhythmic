package storage

import "Rhythmic/internal/models"

type TrackRepository interface {
	Create(track models.Track) (models.Track, error)
	GetByID(id string) (models.Track, error)
	GetAll() ([]models.Track, error)
	GetByArtistID(artistID string) ([]models.Track, error)
	Update(id string, track models.Track) (models.Track, error)
	Delete(id string) error
	Search(query string) ([]models.Track, error)
	GetByIDs(ids []string) ([]models.Track, error)
	GetByGenre(genre string) ([]models.Track, error)
	GetPopular(limit int) ([]models.Track, error)
	IncrementListenCount(id string) error
	IncrementLikesCount(id string) error
	DecrementLikesCount(id string) error
}
