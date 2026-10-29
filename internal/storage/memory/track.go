package memory

import (
	"strings"
	"sync"
	"time"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"
)

type TrackStore struct {
	mu       sync.RWMutex
	byID     map[string]models.Track
	byArtist map[string][]string // artistID -> track IDs
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

func (s *TrackStore) Update(id string, updated models.Track) (models.Track, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.byID[id]
	if !ok {
		return models.Track{}, storage.ErrNotFound
	}

	// If artist ID changed, update index
	if existing.ArtistID != updated.ArtistID {
		// Remove from old artist index
		oldIDs := s.byArtist[existing.ArtistID]
		for i, trackID := range oldIDs {
			if trackID == id {
				s.byArtist[existing.ArtistID] = append(oldIDs[:i], oldIDs[i+1:]...)
				break
			}
		}
		// Add to new artist index
		s.byArtist[updated.ArtistID] = append(s.byArtist[updated.ArtistID], id)
	}

	updated.ID = id
	updated.CreatedAt = existing.CreatedAt
	updated.UpdatedAt = time.Now().UTC()

	s.byID[id] = updated
	return updated, nil
}

func (s *TrackStore) Search(query string) ([]models.Track, error) {
	if strings.TrimSpace(query) == "" {
		return s.GetAll()
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	query = strings.ToLower(strings.TrimSpace(query))
	results := []models.Track{}

	for _, track := range s.byID {
		if strings.Contains(strings.ToLower(track.Title), query) ||
			strings.Contains(strings.ToLower(track.Artist), query) ||
			strings.Contains(strings.ToLower(track.Album), query) ||
			strings.Contains(strings.ToLower(track.Genre), query) {
			results = append(results, track)
		}
	}

	return results, nil
}

func (s *TrackStore) GetByIDs(ids []string) ([]models.Track, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tracks := make([]models.Track, 0, len(ids))
	for _, id := range ids {
		if track, ok := s.byID[id]; ok {
			tracks = append(tracks, track)
		}
	}
	return tracks, nil
}

func (s *TrackStore) GetByGenre(genre string) ([]models.Track, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var tracks []models.Track
	for _, track := range s.byID {
		if track.Genre == genre {
			tracks = append(tracks, track)
		}
	}
	return tracks, nil
}

func (s *TrackStore) GetPopular(limit int) ([]models.Track, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tracks := make([]models.Track, 0, len(s.byID))
	for _, track := range s.byID {
		tracks = append(tracks, track)
	}

	// Sort by listen count (simple bubble sort for memory storage)
	for i := 0; i < len(tracks)-1; i++ {
		for j := 0; j < len(tracks)-i-1; j++ {
			if tracks[j].ListenCount < tracks[j+1].ListenCount {
				tracks[j], tracks[j+1] = tracks[j+1], tracks[j]
			}
		}
	}

	if limit > 0 && limit < len(tracks) {
		tracks = tracks[:limit]
	}

	return tracks, nil
}

func (s *TrackStore) IncrementListenCount(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	track, ok := s.byID[id]
	if !ok {
		return storage.ErrNotFound
	}

	track.ListenCount++
	track.UpdatedAt = time.Now().UTC()
	s.byID[id] = track
	return nil
}

func (s *TrackStore) IncrementLikesCount(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	track, ok := s.byID[id]
	if !ok {
		return storage.ErrNotFound
	}

	track.LikesCount++
	track.UpdatedAt = time.Now().UTC()
	s.byID[id] = track
	return nil
}

func (s *TrackStore) DecrementLikesCount(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	track, ok := s.byID[id]
	if !ok {
		return storage.ErrNotFound
	}

	if track.LikesCount > 0 {
		track.LikesCount--
	}
	track.UpdatedAt = time.Now().UTC()
	s.byID[id] = track
	return nil
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
