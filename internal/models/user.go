package models

import "time"

const (
	RoleListener = "listener"
	RoleArtist   = "artist"
)

// User is the document shape for the user collection (future DB).
type User struct {
	ID           string    `json:"id" bson:"_id"`
	Username     string    `json:"username" bson:"username"`
	Email        string    `json:"email" bson:"email"`
	PasswordHash string    `json:"-" bson:"password_hash"`
	Role         string    `json:"role" bson:"role"`
	CreatedAt    time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" bson:"updated_at"`
}

func ValidRole(role string) bool {
	return role == RoleListener || role == RoleArtist
}
