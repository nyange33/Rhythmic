package tracks

type CreateTrackRequest struct {
	Title    string `json:"title" binding:"required,min=1,max=255"`
	Artist   string `json:"artist" binding:"required,min=1,max=255"`
	Album    string `json:"album" binding:"max=255"`
	Duration int    `json:"duration" binding:"required,min=1"`
	AudioURL string `json:"audio_url" binding:"required,url,max=2048"`
	ArtistID string `json:"artist_id" binding:"required"`
}

type UpdateTrackRequest struct {
	Title    string `json:"title" binding:"omitempty,min=1,max=255"`
	Artist   string `json:"artist" binding:"omitempty,min=1,max=255"`
	Album    string `json:"album" binding:"omitempty,max=255"`
	Duration int    `json:"duration" binding:"omitempty,min=1"`
	AudioURL string `json:"audio_url" binding:"omitempty,url,max=2048"`
	ArtistID string `json:"artist_id" binding:"omitempty"`
}

type TrackView struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Artist    string `json:"artist"`
	Album     string `json:"album"`
	Duration  int    `json:"duration"`
	AudioURL  string `json:"audio_url"`
	ArtistID  string `json:"artist_id"`
	CreatedAt string `json:"created_at"`
}
