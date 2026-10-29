package storage

import "Rhythmic/internal/models"

type LikeRepository interface {
	Create(like models.Like) (models.Like, error)
	GetByID(id string) (models.Like, error)
	GetByUserID(userID string) ([]models.Like, error)
	GetByTrackID(trackID string) ([]models.Like, error)
	IsLiked(userID, trackID string) (bool, error)
	Delete(id string) error
	DeleteByUserAndTrack(userID, trackID string) error
}
