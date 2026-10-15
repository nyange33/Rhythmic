package follows

type CreateFollowRequest struct {
	UserID   string `json:"user_id" binding:"required"`
	ArtistID string `json:"artist_id" binding:"required"`
}

type FollowView struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	ArtistID  string `json:"artist_id"`
	CreatedAt string `json:"created_at"`
}
