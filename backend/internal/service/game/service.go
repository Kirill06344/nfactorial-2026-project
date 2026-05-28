package game

import (
	"errors"

	"github.com/connect4-backend/internal/game"
)

// Service wraps game logic. Not used by current handlers but kept for reference.
type Service struct{}

func NewGameService() *Service { return &Service{} }

type MoveResult struct {
	Board         game.Board `json:"board"`
	CurrentPlayer int        `json:"currentPlayer"`
	Winner        int        `json:"winner,omitempty"`
	IsFinished    bool       `json:"isFinished"`
}

func (s *Service) MakeMove(board game.Board, col, player int) (MoveResult, error) {
	newBoard := board.Copy()

	_, ok := newBoard.DropPiece(col, player)
	if !ok {
		return MoveResult{}, errors.New("column is full or out of range")
	}

	result := MoveResult{
		Board:         newBoard,
		CurrentPlayer: 3 - player,
	}

	if newBoard.CheckWin(player) {
		result.Winner = player
		result.IsFinished = true
	} else if newBoard.IsFull() {
		result.IsFinished = true
	}

	return result, nil
}
