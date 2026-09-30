package main

import (
	"log"
	"os"

	"Rhythmic/internal/modules/auth"
	"Rhythmic/internal/storage/memory"

	"github.com/gin-gonic/gin"
)

func main() {
	users := memory.NewUserStore()
	sessions := memory.NewSessionStore()
	authSvc := auth.NewService(users, sessions)

	r := gin.Default()
	api := r.Group("/api")
	auth.RegisterRoutes(api, authSvc)
	auth.RegisterUserRoutes(api, authSvc)

	addr := ":8090"
	if p := os.Getenv("PORT"); p != "" {
		addr = ":" + p
	}

	log.Println("api listening on", addr)
	if err := r.Run(addr); err != nil {
		log.Fatal(err)
	}
}
