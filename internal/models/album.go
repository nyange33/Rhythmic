package models

import "time"

// Album represents a music album.
type Album struct {
	ID          string    `json:"id" bson:"_id"`
	Title       string    `json:"title" bson:"title"`
	ArtistID    string    `json:"artist_id" bson:"artist_id"`
	ArtistName  string    `json:"artist_name" bson:"artist_name"`
	CoverURL    string    `json:"cover_url" bson:"cover_url"`
	ReleaseDate time.Time `json:"release_date" bson:"release_date"`
	Genre       string    `json:"genre" bson:"genre"`
	TrackIDs    []string  `json:"track_ids" bson:"track_ids"`
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`
}
