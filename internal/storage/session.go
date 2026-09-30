package storage

import "Rhythmic/internal/models"

type SessionRepository interface {
	Create(session models.Session) error
	GetByToken(token string) (models.Session, error)
	Delete(token string) error
}
