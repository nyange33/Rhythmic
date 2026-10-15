package memory

import (
	"sync"
	"time"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"
)

type AlbumStore struct {
	mu         sync.RWMutex
	byID       map[string]models.Album
	byArtistID map[string][]string // artistID -> album IDs
}

func NewAlbumStore() *AlbumStore {
	return &AlbumStore{
		byID:       make(map[string]models.Album),
		byArtistID: make(map[string][]string),
	}
}

func (s *AlbumStore) Create(album models.Album) (models.Album, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UTC()
	if album.ID == "" {
		album.ID = newID()
	}
	if album.TrackIDs == nil {
		album.TrackIDs = []string{}
	}
	album.CreatedAt = now
	album.UpdatedAt = now

	s.byID[album.ID] = album
	s.byArtistID[album.ArtistID] = append(s.byArtistID[album.ArtistID], album.ID)
	return album, nil
}

func (s *AlbumStore) GetByID(id string) (models.Album, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	album, ok := s.byID[id]
	if !ok {
		return models.Album{}, storage.ErrNotFound
	}
	return album, nil
}

func (s *AlbumStore) GetByArtistID(artistID string) ([]models.Album, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ids, ok := s.byArtistID[artistID]
	if !ok {
		return []models.Album{}, nil
	}

	albums := make([]models.Album, 0, len(ids))
	for _, id := range ids {
		if album, ok := s.byID[id]; ok {
			albums = append(albums, album)
		}
	}
	return albums, nil
}

func (s *AlbumStore) GetAll() ([]models.Album, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	albums := make([]models.Album, 0, len(s.byID))
	for _, album := range s.byID {
		albums = append(albums, album)
	}
	return albums, nil
}

func (s *AlbumStore) Update(id string, updated models.Album) (models.Album, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.byID[id]
	if !ok {
		return models.Album{}, storage.ErrNotFound
	}

	// If artist ID changed, update index
	if existing.ArtistID != updated.ArtistID {
		// Remove from old artist index
		oldIDs := s.byArtistID[existing.ArtistID]
		for i, albumID := range oldIDs {
			if albumID == id {
				s.byArtistID[existing.ArtistID] = append(oldIDs[:i], oldIDs[i+1:]...)
				break
			}
		}
		// Add to new artist index
		s.byArtistID[updated.ArtistID] = append(s.byArtistID[updated.ArtistID], id)
	}

	updated.ID = id
	updated.CreatedAt = existing.CreatedAt
	updated.UpdatedAt = time.Now().UTC()

	s.byID[id] = updated
	return updated, nil
}

func (s *AlbumStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	album, ok := s.byID[id]
	if !ok {
		return storage.ErrNotFound
	}

	delete(s.byID, id)

	// Remove from artist index
	ids := s.byArtistID[album.ArtistID]
	for i, albumID := range ids {
		if albumID == id {
			s.byArtistID[album.ArtistID] = append(ids[:i], ids[i+1:]...)
			break
		}
	}

	return nil
}

func (s *AlbumStore) AddTrack(albumID, trackID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	album, ok := s.byID[albumID]
	if !ok {
		return storage.ErrNotFound
	}

	// Check if track already exists
	for _, id := range album.TrackIDs {
		if id == trackID {
			return nil // Already exists
		}
	}

	album.TrackIDs = append(album.TrackIDs, trackID)
	album.UpdatedAt = time.Now().UTC()
	s.byID[albumID] = album
	return nil
}

func (s *AlbumStore) RemoveTrack(albumID, trackID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	album, ok := s.byID[albumID]
	if !ok {
		return storage.ErrNotFound
	}

	for i, id := range album.TrackIDs {
		if id == trackID {
			album.TrackIDs = append(album.TrackIDs[:i], album.TrackIDs[i+1:]...)
			album.UpdatedAt = time.Now().UTC()
			s.byID[albumID] = album
			return nil
		}
	}

	return nil // Track not found, but that's ok
}
