package storage

import "Rhythmic/internal/models"

type ArtistRepository interface {
	Create(artist models.Artist) (models.Artist, error)
	GetByID(id string) (models.Artist, error)
	GetByUserID(userID string) (models.Artist, error)
	GetAll() ([]models.Artist, error)
	Update(id string, artist models.Artist) (models.Artist, error)
	Delete(id string) error
	AddTrack(artistID, trackID string) error
	RemoveTrack(artistID, trackID string) error
	AddAlbum(artistID, albumID string) error
	RemoveAlbum(artistID, albumID string) error
	IncrementFollowers(artistID string) error
	DecrementFollowers(artistID string) error
}
