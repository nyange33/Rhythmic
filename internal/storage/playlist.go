package storage

import "Rhythmic/internal/models"

type PlaylistRepository interface {
	Create(playlist models.Playlist) (models.Playlist, error)
	GetByID(id string) (models.Playlist, error)
	GetByUserID(userID string) ([]models.Playlist, error)
	Update(id string, playlist models.Playlist) (models.Playlist, error)
	Delete(id string) error
	AddTrack(playlistID, trackID string) error
	RemoveTrack(playlistID, trackID string) error
}
