package storage

import "Rhythmic/internal/models"

type UserRepository interface {
	Create(user models.User) (models.User, error)
	GetByID(id string) (models.User, error)
	GetByEmail(email string) (models.User, error)
	Delete(id string) error
}
