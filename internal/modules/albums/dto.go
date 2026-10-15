package albums

type CreateAlbumRequest struct {
	Title       string   `json:"title" binding:"required,min=1,max=255"`
	ArtistID    string   `json:"artist_id" binding:"required"`
	ArtistName  string   `json:"artist_name" binding:"required,min=1,max=255"`
	CoverURL    string   `json:"cover_url" binding:"omitempty,url,max=2048"`
	ReleaseDate string   `json:"release_date" binding:"required"`
	Genre       string   `json:"genre" binding:"max=100"`
	TrackIDs    []string `json:"track_ids"`
}

type UpdateAlbumRequest struct {
	Title       string   `json:"title" binding:"omitempty,min=1,max=255"`
	CoverURL    string   `json:"cover_url" binding:"omitempty,url,max=2048"`
	ReleaseDate string   `json:"release_date" binding:"omitempty"`
	Genre       string   `json:"genre" binding:"omitempty,max=100"`
}

type AlbumView struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	ArtistID    string   `json:"artist_id"`
	ArtistName  string   `json:"artist_name"`
	CoverURL    string   `json:"cover_url"`
	ReleaseDate string   `json:"release_date"`
	Genre       string   `json:"genre"`
	TrackIDs    []string `json:"track_ids"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
}

type AddTrackRequest struct {
	TrackID string `json:"track_id" binding:"required"`
}
