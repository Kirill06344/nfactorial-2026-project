package handlers

import (
	gamehandler "github.com/connect4-backend/internal/handlers/game"
	wshandler "github.com/connect4-backend/internal/handlers/ws"
	"github.com/connect4-backend/internal/room"
	"github.com/gofiber/fiber/v2"

	"github.com/connect4-backend/internal/config"
)

func SetupRoutes(app *fiber.App, _ *config.Config, manager *room.Manager) {
	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	api := app.Group("/api")

	// ── Bot game (stateless REST) ───────────────────────────────────────────
	// GET  /api/game/new       → fresh empty board
	// POST /api/game/bot-move  → player moves, bot responds
	g := api.Group("/game")
	g.Get("/new", gamehandler.NewGame)
	g.Post("/bot-move", gamehandler.BotMove)

	// ── Multiplayer rooms ───────────────────────────────────────────────────
	// POST /api/rooms          → create room, returns {"roomId":"ABC123"}
	api.Post("/rooms", func(c *fiber.Ctx) error {
		id := manager.CreateRoom()
		return c.JSON(fiber.Map{"roomId": id})
	})

	// ── WebSocket ───────────────────────────────────────────────────────────
	// GET /ws/room/:roomId     → WebSocket connection for multiplayer
	app.Get("/ws/room/:roomId", wshandler.RoomHandler(manager))
}
