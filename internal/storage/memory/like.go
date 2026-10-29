package memory

import (
	"sync"
	"time"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"
)

type LikeStore struct {
	mu         sync.RWMutex
	byID       map[string]models.Like
	byUserID   map[string][]string // userID -> like IDs
	byTrackID  map[string][]string // trackID -> like IDs
}

func NewLikeStore() *LikeStore {
	return &LikeStore{
		byID:       make(map[string]models.Like),
		byUserID:   make(map[string][]string),
		byTrackID:  make(map[string][]string),
	}
}

func (s *LikeStore) Create(like models.Like) (models.Like, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Check if already liked
	if s.isLiked(like.UserID, like.TrackID) {
		return models.Like{}, storage.ErrEmailTaken // Reuse error for "already exists"
	}

	now := time.Now().UTC()
	if like.ID == "" {
		like.ID = newID()
	}
	like.CreatedAt = now

	s.byID[like.ID] = like
	s.byUserID[like.UserID] = append(s.byUserID[like.UserID], like.ID)
	s.byTrackID[like.TrackID] = append(s.byTrackID[like.TrackID], like.ID)
	return like, nil
}

func (s *LikeStore) GetByID(id string) (models.Like, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	like, ok := s.byID[id]
	if !ok {
		return models.Like{}, storage.ErrNotFound
	}
	return like, nil
}

func (s *LikeStore) GetByUserID(userID string) ([]models.Like, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ids, ok := s.byUserID[userID]
	if !ok {
		return []models.Like{}, nil
	}

	likes := make([]models.Like, 0, len(ids))
	for _, id := range ids {
		if like, ok := s.byID[id]; ok {
			likes = append(likes, like)
		}
	}
	return likes, nil
}

func (s *LikeStore) GetByTrackID(trackID string) ([]models.Like, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ids, ok := s.byTrackID[trackID]
	if !ok {
		return []models.Like{}, nil
	}

	likes := make([]models.Like, 0, len(ids))
	for _, id := range ids {
		if like, ok := s.byID[id]; ok {
			likes = append(likes, like)
		}
	}
	return likes, nil
}

func (s *LikeStore) IsLiked(userID, trackID string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.isLiked(userID, trackID), nil
}

func (s *LikeStore) isLiked(userID, trackID string) bool {
	ids, ok := s.byUserID[userID]
	if !ok {
		return false
	}

	for _, id := range ids {
		if like, ok := s.byID[id]; ok {
			if like.TrackID == trackID {
				return true
			}
		}
	}
	return false
}

func (s *LikeStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	like, ok := s.byID[id]
	if !ok {
		return storage.ErrNotFound
	}

	delete(s.byID, id)

	// Remove from user index
	userIDs := s.byUserID[like.UserID]
	for i, likeID := range userIDs {
		if likeID == id {
			s.byUserID[like.UserID] = append(userIDs[:i], userIDs[i+1:]...)
			break
		}
	}

	// Remove from track index
	trackIDs := s.byTrackID[like.TrackID]
	for i, likeID := range trackIDs {
		if likeID == id {
			s.byTrackID[like.TrackID] = append(trackIDs[:i], trackIDs[i+1:]...)
			break
		}
	}

	return nil
}

func (s *LikeStore) DeleteByUserAndTrack(userID, trackID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	ids, ok := s.byUserID[userID]
	if !ok {
		return storage.ErrNotFound
	}

	for _, id := range ids {
		if like, ok := s.byID[id]; ok {
			if like.TrackID == trackID {
				return s.deleteInternal(id, like)
			}
		}
	}

	return storage.ErrNotFound
}

func (s *LikeStore) deleteInternal(id string, like models.Like) error {
	delete(s.byID, id)

	// Remove from user index
	userIDs := s.byUserID[like.UserID]
	for i, likeID := range userIDs {
		if likeID == id {
			s.byUserID[like.UserID] = append(userIDs[:i], userIDs[i+1:]...)
			break
		}
	}

	// Remove from track index
	trackIDs := s.byTrackID[like.TrackID]
	for i, likeID := range trackIDs {
		if likeID == id {
			s.byTrackID[like.TrackID] = append(trackIDs[:i], trackIDs[i+1:]...)
			break
		}
	}

	return nil
}
