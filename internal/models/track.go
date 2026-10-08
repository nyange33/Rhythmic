package models

import "time"

// Track is the document shape for the track collection (future DB).
type Track struct {
	ID          string    `json:"id" bson:"_id"`
	Title       string    `json:"title" bson:"title"`
	Artist      string    `json:"artist" bson:"artist"`
	Album       string    `json:"album" bson:"album"`
	Duration    int       `json:"duration" bson:"duration"` // в секундах
	AudioURL    string    `json:"audio_url" bson:"audio_url"`
	ArtistID    string    `json:"artist_id" bson:"artist_id"`
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`
}
