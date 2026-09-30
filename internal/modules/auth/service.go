package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"Rhythmic/internal/models"
	"Rhythmic/internal/storage"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidRole        = errors.New("invalid role")
)

const sessionTTL = 24 * time.Hour

type Service struct {
	users    storage.UserRepository
	sessions storage.SessionRepository
}

func NewService(users storage.UserRepository, sessions storage.SessionRepository) *Service {
	return &Service{users: users, sessions: sessions}
}

func (s *Service) Register(req RegisterRequest) (AuthResponse, error) {
	user, err := s.createUser(req.Username, req.Email, req.Password, req.Role)
	if err != nil {
		return AuthResponse{}, err
	}
	return s.issue(user)
}

func (s *Service) Login(req LoginRequest) (AuthResponse, error) {
	user, err := s.users.GetByEmail(req.Email)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			return AuthResponse{}, ErrInvalidCredentials
		}
		return AuthResponse{}, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return AuthResponse{}, ErrInvalidCredentials
	}
	return s.issue(user)
}

func (s *Service) UserByToken(token string) (models.User, error) {
	session, err := s.sessions.GetByToken(token)
	if err != nil {
		return models.User{}, err
	}
	return s.users.GetByID(session.UserID)
}

func (s *Service) CreateUser(req RegisterRequest) (UserView, error) {
	user, err := s.createUser(req.Username, req.Email, req.Password, req.Role)
	if err != nil {
		return UserView{}, err
	}
	return toView(user), nil
}

func (s *Service) DeleteUser(id string) error {
	return s.users.Delete(id)
}

func (s *Service) createUser(username, email, password, role string) (models.User, error) {
	if role == "" {
		role = models.RoleListener
	}
	if !models.ValidRole(role) {
		return models.User{}, ErrInvalidRole
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return models.User{}, err
	}

	return s.users.Create(models.User{
		Username:     username,
		Email:        email,
		PasswordHash: string(hash),
		Role:         role,
	})
}

func (s *Service) issue(user models.User) (AuthResponse, error) {
	token, err := newToken()
	if err != nil {
		return AuthResponse{}, err
	}
	now := time.Now().UTC()
	if err := s.sessions.Create(models.Session{
		Token:     token,
		UserID:    user.ID,
		ExpiresAt: now.Add(sessionTTL),
		CreatedAt: now,
	}); err != nil {
		return AuthResponse{}, err
	}
	return AuthResponse{Token: token, User: toView(user)}, nil
}

func newToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func toView(user models.User) UserView {
	return UserView{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Role:      user.Role,
		CreatedAt: user.CreatedAt.Format(time.RFC3339),
	}
}
