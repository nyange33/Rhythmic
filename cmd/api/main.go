package main

import (
	"log"
	"os"

	"Rhythmic/internal/middleware"
	"Rhythmic/internal/modules/albums"
	"Rhythmic/internal/modules/auth"
	"Rhythmic/internal/modules/follows"
	"Rhythmic/internal/modules/health"
	"Rhythmic/internal/modules/playlists"
	"Rhythmic/internal/modules/recommendations"
	"Rhythmic/internal/modules/tracks"
	"Rhythmic/internal/storage/memory"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize storage
	users := memory.NewUserStore()
	sessions := memory.NewSessionStore()
	tracks := memory.NewTrackStore()
	playlists := memory.NewPlaylistStore()
	albums := memory.NewAlbumStore()
	artists := memory.NewArtistStore()
	follows := memory.NewFollowStore()

	// Initialize services
	authSvc := auth.NewService(users, sessions)
	tracksSvc := tracks.NewService(tracks)
	playlistsSvc := playlists.NewService(playlists)
	albumsSvc := albums.NewService(albums)
	followsSvc := follows.NewService(follows, artists)
	recommendationsSvc := recommendations.NewService(tracks, follows)
	healthSvc := health.NewService()

	// Setup router
	r := gin.Default()

	// Global middleware
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	// API routes
	api := r.Group("/api")
	health.RegisterRoutes(r, healthSvc)
	auth.RegisterRoutes(api, authSvc)
	auth.RegisterUserRoutes(api, authSvc)
	tracks.RegisterRoutes(api, tracksSvc)
	playlists.RegisterRoutes(api, playlistsSvc)
	albums.RegisterRoutes(api, albumsSvc)
	follows.RegisterRoutes(api, followsSvc)
	recommendations.RegisterRoutes(api, recommendationsSvc)

	// Server configuration
	addr := ":8090"
	if p := os.Getenv("PORT"); p != "" {
		addr = ":" + p
	}

	log.Println("api listening on", addr)
	if err := r.Run(addr); err != nil {
		log.Fatal(err)
	}
}
