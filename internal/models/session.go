package models

import "time"

// Session is the document shape for auth sessions (future DB).
type Session struct {
	Token     string    `json:"token" bson:"token"`
	UserID    string    `json:"user_id" bson:"user_id"`
	ExpiresAt time.Time `json:"expires_at" bson:"expires_at"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
}

func (s Session) Expired() bool {
	return time.Now().After(s.ExpiresAt)
}
