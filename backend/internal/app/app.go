package app

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/websocket/v2"

	"github.com/connect4-backend/internal/config"
	"github.com/connect4-backend/internal/handlers"
	"github.com/connect4-backend/internal/room"
)

type App struct {
	fiber  *fiber.App
	config *config.Config
}

func New() (*App, error) {
	cfg := config.Load()

	app := fiber.New(fiber.Config{
		AppName: "Connect4 API",
	})

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Upgrade HTTP → WebSocket for /ws/* routes
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	roomManager := room.NewManager()
	handlers.SetupRoutes(app, cfg, roomManager)

	return &App{
		fiber:  app,
		config: cfg,
	}, nil
}

func (a *App) Run() error {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	go func() {
		if err := a.fiber.Listen(":" + a.config.Port); err != nil {
			log.Printf("Server error: %v", err)
		}
	}()

	<-c
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return a.fiber.ShutdownWithContext(ctx)
}
