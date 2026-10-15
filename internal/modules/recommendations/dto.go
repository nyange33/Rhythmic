package recommendations

type RecommendationRequest struct {
	UserID  string `json:"user_id" binding:"required"`
	Limit   int    `json:"limit" binding:"omitempty,min=1,max=50"`
	Genre   string `json:"genre"`
}

type RecommendationView struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Artist      string `json:"artist"`
	Album       string `json:"album"`
	Duration    int    `json:"duration"`
	AudioURL    string `json:"audio_url"`
	ArtistID    string `json:"artist_id"`
	Reason      string `json:"reason"` // "based on your follows", "popular", "similar genre"
}

