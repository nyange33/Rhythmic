package models

import "time"

// Follow represents a user following an artist.
type Follow struct {
	ID        string    `json:"id" bson:"_id"`
	UserID    string    `json:"user_id" bson:"user_id"`
	ArtistID  string    `json:"artist_id" bson:"artist_id"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
}
