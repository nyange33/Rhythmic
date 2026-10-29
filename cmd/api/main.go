package main

import (
	"log"
	"os"
	"path/filepath"

	"Rhythmic/internal/middleware"
	"Rhythmic/internal/models"
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
	seedTracks := []models.Track{
		{ID: "1", Title: "1.5", Artist: "королевски 17", Genre: "Electronic", Duration: 91, AudioURL: "/music/1.5.mp3", ArtistID: "artist-demo", ListenCount: 1200000, LikesCount: 42000},
		{ID: "2", Title: "sv moscow", Artist: "королевски 17", Genre: "Hip-Hop", Duration: 143, AudioURL: "/music/sv_moscow.mp3", ArtistID: "artist-demo", ListenCount: 843000, LikesCount: 31000},
		{ID: "3", Title: "грустные губы", Artist: "королевски 17", Genre: "R&B", Duration: 101, AudioURL: "/music/sad_lips.mp3", ArtistID: "artist-demo", ListenCount: 621000, LikesCount: 27000},
		{ID: "4", Title: "sad amber perfume", Artist: "королевски 17", Genre: "Ambient", Duration: 150, AudioURL: "/music/sad_amber_perfume.mp3", ArtistID: "artist-demo", ListenCount: 2100000, LikesCount: 89000},
		{ID: "5", Title: "#satisfaction", Artist: "королевски 17", Genre: "Electronic", Duration: 118, AudioURL: "/music/satisfaction.mp3", ArtistID: "artist-demo", ListenCount: 398000, LikesCount: 18000},
	}
	for _, track := range seedTracks {
		if _, err := trackStore.Create(track); err != nil {
			log.Fatal("failed to seed tracks:", err)
		}
	}
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

	root := "."
	if _, err := os.Stat(filepath.Join(root, "public")); os.IsNotExist(err) {
		root = filepath.Join("..", "..")
	}
	r.Static("/uploads", filepath.Join(root, "public", "uploads"))

	// API routes
	api := r.Group("/api")
	health.RegisterRoutes(r, healthSvc)
	auth.RegisterRoutes(api, authSvc)
	auth.RegisterUserRoutes(api, authSvc)
	tracksModule.RegisterRoutes(api, tracksSvc, authSvc)
	playlistsModule.RegisterRoutes(api, playlistsSvc)
	albumsModule.RegisterRoutes(api, albumsSvc, authSvc)
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
