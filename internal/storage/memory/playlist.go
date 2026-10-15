package memory

import (
	"sync"
	"time"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"
)

type PlaylistStore struct {
	mu       sync.RWMutex
	byID     map[string]models.Playlist
	byUserID map[string][]string // userID -> playlist IDs
}

func NewPlaylistStore() *PlaylistStore {
	return &PlaylistStore{
		byID:     make(map[string]models.Playlist),
		byUserID: make(map[string][]string),
	}
}

func (s *PlaylistStore) Create(playlist models.Playlist) (models.Playlist, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UTC()
	if playlist.ID == "" {
		playlist.ID = newID()
	}
	if playlist.TrackIDs == nil {
		playlist.TrackIDs = []string{}
	}
	playlist.CreatedAt = now
	playlist.UpdatedAt = now

	s.byID[playlist.ID] = playlist
	s.byUserID[playlist.UserID] = append(s.byUserID[playlist.UserID], playlist.ID)
	return playlist, nil
}

func (s *PlaylistStore) GetByID(id string) (models.Playlist, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	playlist, ok := s.byID[id]
	if !ok {
		return models.Playlist{}, storage.ErrNotFound
	}
	return playlist, nil
}

func (s *PlaylistStore) GetByUserID(userID string) ([]models.Playlist, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ids, ok := s.byUserID[userID]
	if !ok {
		return []models.Playlist{}, nil
	}

	playlists := make([]models.Playlist, 0, len(ids))
	for _, id := range ids {
		if playlist, ok := s.byID[id]; ok {
			playlists = append(playlists, playlist)
		}
	}
	return playlists, nil
}

func (s *PlaylistStore) Update(id string, updated models.Playlist) (models.Playlist, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.byID[id]
	if !ok {
		return models.Playlist{}, storage.ErrNotFound
	}

	updated.ID = id
	updated.UserID = existing.UserID
	updated.CreatedAt = existing.CreatedAt
	updated.UpdatedAt = time.Now().UTC()

	s.byID[id] = updated
	return updated, nil
}

func (s *PlaylistStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	playlist, ok := s.byID[id]
	if !ok {
		return storage.ErrNotFound
	}

	delete(s.byID, id)

	// Remove from user index
	ids := s.byUserID[playlist.UserID]
	for i, playlistID := range ids {
		if playlistID == id {
			s.byUserID[playlist.UserID] = append(ids[:i], ids[i+1:]...)
			break
		}
	}

	return nil
}

func (s *PlaylistStore) AddTrack(playlistID, trackID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	playlist, ok := s.byID[playlistID]
	if !ok {
		return storage.ErrNotFound
	}

	// Check if track already exists
	for _, id := range playlist.TrackIDs {
		if id == trackID {
			return nil // Already exists
		}
	}

	playlist.TrackIDs = append(playlist.TrackIDs, trackID)
	playlist.UpdatedAt = time.Now().UTC()
	s.byID[playlistID] = playlist
	return nil
}

func (s *PlaylistStore) RemoveTrack(playlistID, trackID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	playlist, ok := s.byID[playlistID]
	if !ok {
		return storage.ErrNotFound
	}

	for i, id := range playlist.TrackIDs {
		if id == trackID {
			playlist.TrackIDs = append(playlist.TrackIDs[:i], playlist.TrackIDs[i+1:]...)
			playlist.UpdatedAt = time.Now().UTC()
			s.byID[playlistID] = playlist
			return nil
		}
	}

	return nil // Track not found, but that's ok
}
