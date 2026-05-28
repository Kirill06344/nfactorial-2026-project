package matches

import (
	"time"

	"github.com/google/uuid"
)

type Match struct {
	ID         uuid.UUID  `json:"id"`
	UserID     uuid.UUID  `json:"user_id"`
	OpponentID *uuid.UUID `json:"opponent_id,omitempty"`
	Mode       string     `json:"mode"`
	Result     string     `json:"result"`
	CreatedAt  time.Time  `json:"created_at"`
}
