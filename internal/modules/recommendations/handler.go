package recommendations

import (
	"math/rand"
	"net/http"
	"time"

	"Rhythmic/internal/storage"

	"github.com/gin-gonic/gin"
)

type Service struct {
	tracks  storage.TrackRepository
	follows storage.FollowRepository
}

func NewService(tracks storage.TrackRepository, follows storage.FollowRepository) *Service {
	return &Service{tracks: tracks, follows: follows}
}

func RegisterRoutes(rg *gin.RouterGroup, svc *Service) {
	g := rg.Group("/recommendations")
	g.GET("", func(c *gin.Context) { handleGetRecommendations(c, svc) })
}

func handleGetRecommendations(c *gin.Context, svc *Service) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	limit := 10
	if l := c.Query("limit"); l != "" {
		var lim int
		if err := c.BindQuery(&lim); err == nil && lim > 0 && lim <= 50 {
			limit = lim
		}
	}

	recommendations, err := svc.GetRecommendations(userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get recommendations"})
		return
	}
	c.JSON(http.StatusOK, recommendations)
}

func (s *Service) GetRecommendations(userID string, limit int) ([]RecommendationView, error) {
	// Get artists user follows
	follows, err := s.follows.GetByUserID(userID)
	if err != nil {
		return nil, err
	}

	// Get tracks from followed artists
	recommendations := []RecommendationView{}
	artistIDs := make(map[string]bool)
	for _, follow := range follows {
		artistIDs[follow.ArtistID] = true
		tracks, err := s.tracks.GetByArtistID(follow.ArtistID)
		if err != nil {
			continue
		}
		for _, track := range tracks {
			if len(recommendations) >= limit {
				break
			}
			recommendations = append(recommendations, RecommendationView{
				ID:       track.ID,
				Title:    track.Title,
				Artist:   track.Artist,
				Album:    track.Album,
				Duration: track.Duration,
				AudioURL: track.AudioURL,
				ArtistID: track.ArtistID,
				Reason:   "based on your follows",
			})
		}
	}

	// If not enough, add random popular tracks
	if len(recommendations) < limit {
		allTracks, err := s.tracks.GetAll()
		if err == nil {
			rand.Seed(time.Now().UnixNano())
			rand.Shuffle(len(allTracks), func(i, j int) {
				allTracks[i], allTracks[j] = allTracks[j], allTracks[i]
			})

			for _, track := range allTracks {
				if len(recommendations) >= limit {
					break
				}
				// Skip if from already followed artist
				if _, followed := artistIDs[track.ArtistID]; !followed {
					recommendations = append(recommendations, RecommendationView{
						ID:       track.ID,
						Title:    track.Title,
						Artist:   track.Artist,
						Album:    track.Album,
						Duration: track.Duration,
						AudioURL: track.AudioURL,
						ArtistID: track.ArtistID,
						Reason:   "popular",
					})
				}
			}
		}
	}

	return recommendations, nil
}

