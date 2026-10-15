package memory

import (
	"sync"
	"time"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"
)

type FollowStore struct {
	mu         sync.RWMutex
	byID       map[string]models.Follow
	byUserID   map[string][]string // userID -> follow IDs
	byArtistID map[string][]string // artistID -> follow IDs
}

func NewFollowStore() *FollowStore {
	return &FollowStore{
		byID:       make(map[string]models.Follow),
		byUserID:   make(map[string][]string),
		byArtistID: make(map[string][]string),
	}
}

func (s *FollowStore) Create(follow models.Follow) (models.Follow, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Check if already following
	if s.isFollowing(follow.UserID, follow.ArtistID) {
		return models.Follow{}, storage.ErrEmailTaken // Reuse error for "already exists"
	}

	now := time.Now().UTC()
	if follow.ID == "" {
		follow.ID = newID()
	}
	follow.CreatedAt = now

	s.byID[follow.ID] = follow
	s.byUserID[follow.UserID] = append(s.byUserID[follow.UserID], follow.ID)
	s.byArtistID[follow.ArtistID] = append(s.byArtistID[follow.ArtistID], follow.ID)
	return follow, nil
}

func (s *FollowStore) GetByID(id string) (models.Follow, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	follow, ok := s.byID[id]
	if !ok {
		return models.Follow{}, storage.ErrNotFound
	}
	return follow, nil
}

func (s *FollowStore) GetByUserID(userID string) ([]models.Follow, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ids, ok := s.byUserID[userID]
	if !ok {
		return []models.Follow{}, nil
	}

	follows := make([]models.Follow, 0, len(ids))
	for _, id := range ids {
		if follow, ok := s.byID[id]; ok {
			follows = append(follows, follow)
		}
	}
	return follows, nil
}

func (s *FollowStore) GetByArtistID(artistID string) ([]models.Follow, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ids, ok := s.byArtistID[artistID]
	if !ok {
		return []models.Follow{}, nil
	}

	follows := make([]models.Follow, 0, len(ids))
	for _, id := range ids {
		if follow, ok := s.byID[id]; ok {
			follows = append(follows, follow)
		}
	}
	return follows, nil
}

func (s *FollowStore) IsFollowing(userID, artistID string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.isFollowing(userID, artistID), nil
}

func (s *FollowStore) isFollowing(userID, artistID string) bool {
	ids, ok := s.byUserID[userID]
	if !ok {
		return false
	}

	for _, id := range ids {
		if follow, ok := s.byID[id]; ok {
			if follow.ArtistID == artistID {
				return true
			}
		}
	}
	return false
}

func (s *FollowStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	follow, ok := s.byID[id]
	if !ok {
		return storage.ErrNotFound
	}

	delete(s.byID, id)

	// Remove from user index
	userIDs := s.byUserID[follow.UserID]
	for i, followID := range userIDs {
		if followID == id {
			s.byUserID[follow.UserID] = append(userIDs[:i], userIDs[i+1:]...)
			break
		}
	}

	// Remove from artist index
	artistIDs := s.byArtistID[follow.ArtistID]
	for i, followID := range artistIDs {
		if followID == id {
			s.byArtistID[follow.ArtistID] = append(artistIDs[:i], artistIDs[i+1:]...)
			break
		}
	}

	return nil
}

func (s *FollowStore) DeleteByUserAndArtist(userID, artistID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	ids, ok := s.byUserID[userID]
	if !ok {
		return storage.ErrNotFound
	}

	for _, id := range ids {
		if follow, ok := s.byID[id]; ok {
			if follow.ArtistID == artistID {
				return s.deleteInternal(id, follow)
			}
		}
	}

	return storage.ErrNotFound
}

func (s *FollowStore) deleteInternal(id string, follow models.Follow) error {
	delete(s.byID, id)

	// Remove from user index
	userIDs := s.byUserID[follow.UserID]
	for i, followID := range userIDs {
		if followID == id {
			s.byUserID[follow.UserID] = append(userIDs[:i], userIDs[i+1:]...)
			break
		}
	}

	// Remove from artist index
	artistIDs := s.byArtistID[follow.ArtistID]
	for i, followID := range artistIDs {
		if followID == id {
			s.byArtistID[follow.ArtistID] = append(artistIDs[:i], artistIDs[i+1:]...)
			break
		}
	}

	return nil
}
