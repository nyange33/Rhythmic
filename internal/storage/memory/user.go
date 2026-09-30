package memory

import (
	"strings"
	"sync"
	"time"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"
)

type UserStore struct {
	mu    sync.RWMutex
	byID  map[string]models.User
	email map[string]string
	name  map[string]string
}

func NewUserStore() *UserStore {
	return &UserStore{
		byID:  make(map[string]models.User),
		email: make(map[string]string),
		name:  make(map[string]string),
	}
}

func (s *UserStore) Create(user models.User) (models.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	email := strings.ToLower(user.Email)
	name := strings.ToLower(user.Username)

	if _, ok := s.email[email]; ok {
		return models.User{}, storage.ErrEmailTaken
	}
	if _, ok := s.name[name]; ok {
		return models.User{}, storage.ErrUsernameTaken
	}

	now := time.Now().UTC()
	if user.ID == "" {
		user.ID = newID()
	}
	user.Email = email
	user.CreatedAt = now
	user.UpdatedAt = now

	s.byID[user.ID] = user
	s.email[email] = user.ID
	s.name[name] = user.ID
	return user, nil
}

func (s *UserStore) GetByID(id string) (models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, ok := s.byID[id]
	if !ok {
		return models.User{}, storage.ErrNotFound
	}
	return user, nil
}

func (s *UserStore) GetByEmail(email string) (models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	id, ok := s.email[strings.ToLower(email)]
	if !ok {
		return models.User{}, storage.ErrNotFound
	}
	return s.byID[id], nil
}

func (s *UserStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	user, ok := s.byID[id]
	if !ok {
		return storage.ErrNotFound
	}
	delete(s.byID, id)
	delete(s.email, strings.ToLower(user.Email))
	delete(s.name, strings.ToLower(user.Username))
	return nil
}
