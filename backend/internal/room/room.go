package room

import (
	"math/rand"
	"sync"
	"time"

	"github.com/connect4-backend/internal/game"
	"github.com/gofiber/websocket/v2"
)

// ---------- Message types ----------

type IncomingMessage struct {
	Type   string `json:"type"`
	Column int    `json:"column"`
}

type JoinedMessage struct {
	Type      string `json:"type"`
	YourPiece int    `json:"yourPiece"`
	RoomID    string `json:"roomId"`
}

type WaitingMessage struct {
	Type string `json:"type"`
}

type StateMessage struct {
	Type          string     `json:"type"`
	Board         game.Board `json:"board"`
	CurrentPlayer int        `json:"currentPlayer"`
	Winner        int        `json:"winner"`
	Finished      bool       `json:"finished"`
}

type ErrorMessage struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

type OpponentLeftMessage struct {
	Type string `json:"type"`
}

// ---------- Room ----------

// Room represents an active game room with up to 2 players.
// piece 1 (Red)    → conns[0]
// piece 2 (Yellow) → conns[1]
type Room struct {
	ID    string
	conns [2]*websocket.Conn
	state *game.GameState
	mu    sync.Mutex
}

func newRoom(id string) *Room {
	return &Room{
		ID:    id,
		state: freshState(),
	}
}

func freshState() *game.GameState {
	board := game.NewBoard()
	return &game.GameState{
		Board:         board,
		CurrentPlayer: game.Red,
	}
}

// Join assigns the player a piece and returns (piece, bothConnected, ok).
// ok=false means the room is full.
func (r *Room) Join(conn *websocket.Conn) (piece int, bothConnected bool, ok bool) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.conns[0] == nil {
		r.conns[0] = conn
		return game.Red, r.conns[1] != nil, true
	}
	if r.conns[1] == nil {
		r.conns[1] = conn
		return game.Yellow, true, true
	}
	return 0, false, false
}

// Leave removes the player's connection, notifies the opponent, and resets the game.
func (r *Room) Leave(piece int) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.conns[piece-1] = nil

	other := r.conns[2-piece] // piece=1→index1, piece=2→index0
	if other != nil {
		other.WriteJSON(OpponentLeftMessage{Type: "opponent_left"}) //nolint:errcheck
	}

	r.state = freshState()
}

// HandleMove processes a move from the given piece (1 or 2).
func (r *Room) HandleMove(piece, column int) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.conns[0] == nil || r.conns[1] == nil {
		r.errorf(piece, "waiting for opponent")
		return
	}
	if r.state.Finished {
		r.errorf(piece, "game is already finished")
		return
	}
	if r.state.CurrentPlayer != piece {
		r.errorf(piece, "not your turn")
		return
	}
	if column < 0 || column >= game.Cols {
		r.errorf(piece, "column out of range")
		return
	}

	_, ok := r.state.Board.DropPiece(column, piece)
	if !ok {
		r.errorf(piece, "column is full")
		return
	}

	if r.state.Board.CheckWin(piece) {
		r.state.Winner = piece
		r.state.Finished = true
	} else if r.state.Board.IsFull() {
		r.state.Finished = true
	} else {
		r.state.CurrentPlayer = 3 - piece // toggle 1↔2
	}

	r.broadcastState()
}

// BroadcastStart sends the initial game state to both players.
func (r *Room) BroadcastStart() {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.broadcastState()
}

func (r *Room) broadcastState() {
	msg := StateMessage{
		Type:          "state",
		Board:         r.state.Board,
		CurrentPlayer: r.state.CurrentPlayer,
		Winner:        r.state.Winner,
		Finished:      r.state.Finished,
	}
	for _, conn := range r.conns {
		if conn != nil {
			conn.WriteJSON(msg) //nolint:errcheck
		}
	}
}

func (r *Room) errorf(piece int, message string) {
	conn := r.conns[piece-1]
	if conn != nil {
		conn.WriteJSON(ErrorMessage{Type: "error", Message: message}) //nolint:errcheck
	}
}

// ---------- Manager ----------

type Manager struct {
	rooms map[string]*Room
	mu    sync.RWMutex
	rng   *rand.Rand
}

func NewManager() *Manager {
	return &Manager{
		rooms: make(map[string]*Room),
		rng:   rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

// CreateRoom creates a new room and returns its ID.
func (m *Manager) CreateRoom() string {
	m.mu.Lock()
	defer m.mu.Unlock()

	id := m.generateID()
	m.rooms[id] = newRoom(id)
	return id
}

// GetRoom returns a room by ID.
func (m *Manager) GetRoom(id string) (*Room, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	r, ok := m.rooms[id]
	return r, ok
}

// DeleteRoom removes a room.
func (m *Manager) DeleteRoom(id string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.rooms, id)
}

const idChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func (m *Manager) generateID() string {
	b := make([]byte, 6)
	for i := range b {
		b[i] = idChars[m.rng.Intn(len(idChars))]
	}
	// Regenerate if collision (extremely unlikely)
	id := string(b)
	if _, exists := m.rooms[id]; exists {
		return m.generateID()
	}
	return id
}
