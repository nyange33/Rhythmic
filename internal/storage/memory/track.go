package memory

import (
	"sync"
	"time"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"
)

type TrackStore struct {
	mu        sync.RWMutex
	byID      map[string]models.Track
	byArtist  map[string][]string // artistID -> track IDs
}

func NewTrackStore() *TrackStore {
	return &TrackStore{
		byID:     make(map[string]models.Track),
		byArtist: make(map[string][]string),
	}
}

func (s *TrackStore) Create(track models.Track) (models.Track, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UTC()
	if track.ID == "" {
		track.ID = newID()
	}
	track.CreatedAt = now
	track.UpdatedAt = now

	s.byID[track.ID] = track
	s.byArtist[track.ArtistID] = append(s.byArtist[track.ArtistID], track.ID)
	return track, nil
}

func (s *TrackStore) GetByID(id string) (models.Track, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	track, ok := s.byID[id]
	if !ok {
		return models.Track{}, storage.ErrNotFound
	}
	return track, nil
}

func (s *TrackStore) GetAll() ([]models.Track, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tracks := make([]models.Track, 0, len(s.byID))
	for _, track := range s.byID {
		tracks = append(tracks, track)
	}
	return tracks, nil
}

func (s *TrackStore) GetByArtistID(artistID string) ([]models.Track, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ids, ok := s.byArtist[artistID]
	if !ok {
		return []models.Track{}, nil
	}

	tracks := make([]models.Track, 0, len(ids))
	for _, id := range ids {
		if track, ok := s.byID[id]; ok {
			tracks = append(tracks, track)
		}
	}
	return tracks, nil
}

func (s *TrackStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	track, ok := s.byID[id]
	if !ok {
		return storage.ErrNotFound
	}

	delete(s.byID, id)

	// Remove from artist index
	ids := s.byArtist[track.ArtistID]
	for i, trackID := range ids {
		if trackID == id {
			s.byArtist[track.ArtistID] = append(ids[:i], ids[i+1:]...)
			break
		}
	}

	return nil
}
