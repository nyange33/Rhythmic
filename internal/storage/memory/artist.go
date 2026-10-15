package memory

import (
	"sync"
	"time"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"
)

type ArtistStore struct {
	mu       sync.RWMutex
	byID     map[string]models.Artist
	byUserID map[string]string // userID -> artistID
}

func NewArtistStore() *ArtistStore {
	return &ArtistStore{
		byID:     make(map[string]models.Artist),
		byUserID: make(map[string]string),
	}
}

func (s *ArtistStore) Create(artist models.Artist) (models.Artist, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Check if artist already exists for this user
	if _, ok := s.byUserID[artist.UserID]; ok {
		return models.Artist{}, storage.ErrEmailTaken // Reuse error for "already exists"
	}

	now := time.Now().UTC()
	if artist.ID == "" {
		artist.ID = newID()
	}
	if artist.TrackIDs == nil {
		artist.TrackIDs = []string{}
	}
	if artist.AlbumIDs == nil {
		artist.AlbumIDs = []string{}
	}
	artist.CreatedAt = now
	artist.UpdatedAt = now

	s.byID[artist.ID] = artist
	s.byUserID[artist.UserID] = artist.ID
	return artist, nil
}

func (s *ArtistStore) GetByID(id string) (models.Artist, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	artist, ok := s.byID[id]
	if !ok {
		return models.Artist{}, storage.ErrNotFound
	}
	return artist, nil
}

func (s *ArtistStore) GetByUserID(userID string) (models.Artist, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	artistID, ok := s.byUserID[userID]
	if !ok {
		return models.Artist{}, storage.ErrNotFound
	}
	return s.byID[artistID], nil
}

func (s *ArtistStore) GetAll() ([]models.Artist, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	artists := make([]models.Artist, 0, len(s.byID))
	for _, artist := range s.byID {
		artists = append(artists, artist)
	}
	return artists, nil
}

func (s *ArtistStore) Update(id string, updated models.Artist) (models.Artist, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.byID[id]
	if !ok {
		return models.Artist{}, storage.ErrNotFound
	}

	updated.ID = id
	updated.UserID = existing.UserID
	updated.CreatedAt = existing.CreatedAt
	updated.UpdatedAt = time.Now().UTC()

	s.byID[id] = updated
	return updated, nil
}

func (s *ArtistStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	artist, ok := s.byID[id]
	if !ok {
		return storage.ErrNotFound
	}

	delete(s.byID, id)
	delete(s.byUserID, artist.UserID)
	return nil
}

func (s *ArtistStore) AddTrack(artistID, trackID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	artist, ok := s.byID[artistID]
	if !ok {
		return storage.ErrNotFound
	}

	// Check if track already exists
	for _, id := range artist.TrackIDs {
		if id == trackID {
			return nil // Already exists
		}
	}

	artist.TrackIDs = append(artist.TrackIDs, trackID)
	artist.UpdatedAt = time.Now().UTC()
	s.byID[artistID] = artist
	return nil
}

func (s *ArtistStore) RemoveTrack(artistID, trackID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	artist, ok := s.byID[artistID]
	if !ok {
		return storage.ErrNotFound
	}

	for i, id := range artist.TrackIDs {
		if id == trackID {
			artist.TrackIDs = append(artist.TrackIDs[:i], artist.TrackIDs[i+1:]...)
			artist.UpdatedAt = time.Now().UTC()
			s.byID[artistID] = artist
			return nil
		}
	}

	return nil // Track not found, but that's ok
}

func (s *ArtistStore) AddAlbum(artistID, albumID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	artist, ok := s.byID[artistID]
	if !ok {
		return storage.ErrNotFound
	}

	// Check if album already exists
	for _, id := range artist.AlbumIDs {
		if id == albumID {
			return nil // Already exists
		}
	}

	artist.AlbumIDs = append(artist.AlbumIDs, albumID)
	artist.UpdatedAt = time.Now().UTC()
	s.byID[artistID] = artist
	return nil
}

func (s *ArtistStore) RemoveAlbum(artistID, albumID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	artist, ok := s.byID[artistID]
	if !ok {
		return storage.ErrNotFound
	}

	for i, id := range artist.AlbumIDs {
		if id == albumID {
			artist.AlbumIDs = append(artist.AlbumIDs[:i], artist.AlbumIDs[i+1:]...)
			artist.UpdatedAt = time.Now().UTC()
			s.byID[artistID] = artist
			return nil
		}
	}

	return nil // Album not found, but that's ok
}

func (s *ArtistStore) IncrementFollowers(artistID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	artist, ok := s.byID[artistID]
	if !ok {
		return storage.ErrNotFound
	}

	artist.FollowersCount++
	artist.UpdatedAt = time.Now().UTC()
	s.byID[artistID] = artist
	return nil
}

func (s *ArtistStore) DecrementFollowers(artistID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	artist, ok := s.byID[artistID]
	if !ok {
		return storage.ErrNotFound
	}

	if artist.FollowersCount > 0 {
		artist.FollowersCount--
	}
	artist.UpdatedAt = time.Now().UTC()
	s.byID[artistID] = artist
	return nil
}
