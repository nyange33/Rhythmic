package playlists

type CreatePlaylistRequest struct {
	Name        string   `json:"name" binding:"required,min=1,max=255"`
	Description string   `json:"description" binding:"max=1000"`
	CoverURL    string   `json:"cover_url" binding:"omitempty,url,max=2048"`
	IsPublic    bool     `json:"is_public"`
	TrackIDs    []string `json:"track_ids"`
}

type UpdatePlaylistRequest struct {
	Name        string   `json:"name" binding:"omitempty,min=1,max=255"`
	Description string   `json:"description" binding:"omitempty,max=1000"`
	CoverURL    string   `json:"cover_url" binding:"omitempty,url,max=2048"`
	IsPublic    *bool    `json:"is_public"`
}

type PlaylistView struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	UserID      string   `json:"user_id"`
	TrackIDs    []string `json:"track_ids"`
	CoverURL    string   `json:"cover_url"`
	IsPublic    bool     `json:"is_public"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
}

type AddTrackRequest struct {
	TrackID string `json:"track_id" binding:"required"`
}
