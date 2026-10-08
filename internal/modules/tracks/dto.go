package tracks

type CreateTrackRequest struct {
	Title    string `json:"title" binding:"required"`
	Artist   string `json:"artist" binding:"required"`
	Album    string `json:"album"`
	Duration int    `json:"duration" binding:"required"`
	AudioURL string `json:"audio_url" binding:"required"`
	ArtistID string `json:"artist_id" binding:"required"`
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
