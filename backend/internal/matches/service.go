package matches

import (
	"context"

	"github.com/google/uuid"
)

type Service struct {
	repo Repository
}

type Repository interface {
	CreateMatch(ctx context.Context, m Match) error
	GetUserMatches(ctx context.Context, userID uuid.UUID) ([]Match, error)
}
