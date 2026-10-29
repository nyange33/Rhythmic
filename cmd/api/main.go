package main

import (
	"log"
	"os"

	"Rhythmic/internal/middleware"
	albumsModule "Rhythmic/internal/modules/albums"
	"Rhythmic/internal/modules/auth"
	followsModule "Rhythmic/internal/modules/follows"
	"Rhythmic/internal/modules/health"
	likesModule "Rhythmic/internal/modules/likes"
	playlistsModule "Rhythmic/internal/modules/playlists"
	"Rhythmic/internal/modules/recommendations"
	tracksModule "Rhythmic/internal/modules/tracks"
	"Rhythmic/internal/storage/memory"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize storage
	users := memory.NewUserStore()
	sessions := memory.NewSessionStore()
	trackStore := memory.NewTrackStore()
	playlistStore := memory.NewPlaylistStore()
	albumStore := memory.NewAlbumStore()
	artistStore := memory.NewArtistStore()
	followStore := memory.NewFollowStore()
	likeStore := memory.NewLikeStore()

	// Initialize services
	authSvc := auth.NewService(users, sessions)
	tracksSvc := tracksModule.NewService(trackStore)
	playlistsSvc := playlistsModule.NewService(playlistStore)
	albumsSvc := albumsModule.NewService(albumStore)
	followsSvc := followsModule.NewService(followStore, artistStore)
	likesSvc := likesModule.NewService(likeStore, trackStore)
	recommendationsSvc := recommendations.NewService(trackStore, followStore)
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
	tracksModule.RegisterRoutes(api, tracksSvc)
	playlistsModule.RegisterRoutes(api, playlistsSvc)
	albumsModule.RegisterRoutes(api, albumsSvc)
	followsModule.RegisterRoutes(api, followsSvc)
	likesSvc.RegisterRoutes(api)
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
