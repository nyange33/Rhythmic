package likes

import "Rhythmic/internal/models"

type CreateLikeRequest struct {
	UserID  string `json:"user_id" binding:"required"`
	TrackID string `json:"track_id" binding:"required"`
}

type LikeView struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	TrackID   string `json:"track_id"`
	CreatedAt string `json:"created_at"`
}

func toView(like models.Like) LikeView {
	return LikeView{
		ID:        like.ID,
		UserID:    like.UserID,
		TrackID:   like.TrackID,
		CreatedAt: like.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
