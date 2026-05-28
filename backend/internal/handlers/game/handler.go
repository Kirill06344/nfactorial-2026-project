package game

import (
	"github.com/connect4-backend/internal/game"
	"github.com/gofiber/fiber/v2"
)

// NewGame returns an empty board ready to play.
// GET /api/game/new
func NewGame(c *fiber.Ctx) error {
	board := game.NewBoard()
	return c.JSON(fiber.Map{
		"board":         board,
		"currentPlayer": game.Red,
		"winner":        0,
		"finished":      false,
	})
}

// BotMove handles the player's move then immediately replies with the bot's move.
// POST /api/game/bot-move
//
// Request body:
//
//	{
//	  "board":       [[...6x7 ints...]],
//	  "column":      3,          // player's chosen column (0–6)
//	  "playerPiece": 1,          // 1=Red, 2=Yellow
//	  "depth":       5           // minimax depth (1–10, default 5)
//	}
//
// Response:
//
//	{
//	  "board":         [[...]],
//	  "currentPlayer": 1,
//	  "winner":        0,
//	  "finished":      false,
//	  "botColumn":     4   // -1 if bot didn't move (game already ended)
//	}
func BotMove(c *fiber.Ctx) error {
	var req struct {
		Board       game.Board `json:"board"`
		Column      int        `json:"column"`
		PlayerPiece int        `json:"playerPiece"`
		Depth       int        `json:"depth"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if req.PlayerPiece != game.Red && req.PlayerPiece != game.Yellow {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "playerPiece must be 1 (Red) or 2 (Yellow)"})
	}

	if req.Depth <= 0 || req.Depth > 10 {
		req.Depth = 5
	}

	botPiece := 3 - req.PlayerPiece

	// Apply player's move
	_, ok := req.Board.DropPiece(req.Column, req.PlayerPiece)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid move: column is full or out of range"})
	}

	// Check if player won after their move
	if req.Board.CheckWin(req.PlayerPiece) {
		return c.JSON(fiber.Map{
			"board":         req.Board,
			"currentPlayer": req.PlayerPiece,
			"winner":        req.PlayerPiece,
			"finished":      true,
			"botColumn":     -1,
		})
	}
	if req.Board.IsFull() {
		return c.JSON(fiber.Map{
			"board":         req.Board,
			"currentPlayer": req.PlayerPiece,
			"winner":        0,
			"finished":      true,
			"botColumn":     -1,
		})
	}

	// Bot responds
	botCol := req.Board.GetBestMove(req.Depth, botPiece)
	req.Board.DropPiece(botCol, botPiece)

	winner := 0
	finished := false
	if req.Board.CheckWin(botPiece) {
		winner = botPiece
		finished = true
	} else if req.Board.IsFull() {
		finished = true
	}

	return c.JSON(fiber.Map{
		"board":         req.Board,
		"currentPlayer": req.PlayerPiece,
		"winner":        winner,
		"finished":      finished,
		"botColumn":     botCol,
	})
}
