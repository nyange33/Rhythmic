package storage

import "Rhythmic/internal/models"

type FollowRepository interface {
	Create(follow models.Follow) (models.Follow, error)
	GetByID(id string) (models.Follow, error)
	GetByUserID(userID string) ([]models.Follow, error)
	GetByArtistID(artistID string) ([]models.Follow, error)
	IsFollowing(userID, artistID string) (bool, error)
	Delete(id string) error
	DeleteByUserAndArtist(userID, artistID string) error
}
