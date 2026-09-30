package memory

import (
	"sync"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"
)

type SessionStore struct {
	mu   sync.RWMutex
	byID map[string]models.Session
}

func NewSessionStore() *SessionStore {
	return &SessionStore{byID: make(map[string]models.Session)}
}

func (s *SessionStore) Create(session models.Session) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.byID[session.Token] = session
	return nil
}

func (s *SessionStore) GetByToken(token string) (models.Session, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	session, ok := s.byID[token]
	if !ok {
		return models.Session{}, storage.ErrNotFound
	}
	if session.Expired() {
		return models.Session{}, storage.ErrNotFound
	}
	return session, nil
}

func (s *SessionStore) Delete(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.byID, token)
	return nil
}
