package models

import "time"

// Playlist represents a user's playlist.
type Playlist struct {
	ID          string    `json:"id" bson:"_id"`
	Name        string    `json:"name" bson:"name"`
	Description string    `json:"description" bson:"description"`
	UserID      string    `json:"user_id" bson:"user_id"`
	TrackIDs    []string  `json:"track_ids" bson:"track_ids"`
	CoverURL    string    `json:"cover_url" bson:"cover_url"`
	IsPublic    bool      `json:"is_public" bson:"is_public"`
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`
}
