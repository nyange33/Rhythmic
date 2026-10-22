package models

import "time"

// Artist represents a music artist profile.
type Artist struct {
	ID              string    `json:"id" bson:"_id"`
	UserID          string    `json:"user_id" bson:"user_id"`
	DisplayName     string    `json:"display_name" bson:"display_name"`
	Bio             string    `json:"bio" bson:"bio"`
	CoverURL        string    `json:"cover_url" bson:"cover_url"`
	ProfileImageURL string    `json:"profile_image_url" bson:"profile_image_url"`
	FollowersCount  int       `json:"followers_count" bson:"followers_count"`
	TotalPlays      int       `json:"total_plays" bson:"total_plays"`
	TotalLikes      int       `json:"total_likes" bson:"total_likes"`
	TrackIDs        []string  `json:"track_ids" bson:"track_ids"`
	AlbumIDs        []string  `json:"album_ids" bson:"album_ids"`
	CreatedAt       time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" bson:"updated_at"`
}
