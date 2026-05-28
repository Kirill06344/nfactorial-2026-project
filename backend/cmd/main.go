package main

import (
	"log"

	"github.com/connect4-backend/internal/app"
)

func main() {
	application, err := app.New()
	if err != nil {
		log.Fatalf("Failed to create app: %v", err)
	}

	if err := application.Run(); err != nil {
		log.Fatalf("App stopped with error: %v", err)
	}
}
