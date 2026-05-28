package ws

import (
	"log"

	"github.com/connect4-backend/internal/room"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

// RoomHandler returns a WebSocket handler for a multiplayer room.
//
// Connect: GET /ws/room/:roomId
//
// Server → Client messages:
//
//	{"type":"joined",        "yourPiece":1, "roomId":"ABC123"}  – on connect
//	{"type":"waiting"}                                           – waiting for 2nd player
//	{"type":"state",         "board":[...], "currentPlayer":1, "winner":0, "finished":false}
//	{"type":"opponent_left"}                                     – opponent disconnected
//	{"type":"error",         "message":"..."}
//
// Client → Server messages:
//
//	{"type":"move", "column":3}
func RoomHandler(manager *room.Manager) fiber.Handler {
	return websocket.New(func(c *websocket.Conn) {
		roomID := c.Params("roomId")

		r, ok := manager.GetRoom(roomID)
		if !ok {
			c.WriteJSON(room.ErrorMessage{Type: "error", Message: "room not found"}) //nolint:errcheck
			return
		}

		piece, bothConnected, joined := r.Join(c)
		if !joined {
			c.WriteJSON(room.ErrorMessage{Type: "error", Message: "room is full"}) //nolint:errcheck
			return
		}

		defer r.Leave(piece)

		// Tell the player which piece they are
		if err := c.WriteJSON(room.JoinedMessage{
			Type:      "joined",
			YourPiece: piece,
			RoomID:    roomID,
		}); err != nil {
			log.Printf("ws write error (room %s): %v", roomID, err)
			return
		}

		if bothConnected {
			// Both players are in — send initial board state to both
			r.BroadcastStart()
		} else {
			// Still waiting for the second player
			c.WriteJSON(room.WaitingMessage{Type: "waiting"}) //nolint:errcheck
		}

		// Message loop
		for {
			var msg room.IncomingMessage
			if err := c.ReadJSON(&msg); err != nil {
				log.Printf("ws disconnect (room %s, piece %d): %v", roomID, piece, err)
				break
			}

			switch msg.Type {
			case "move":
				r.HandleMove(piece, msg.Column)
			default:
				c.WriteJSON(room.ErrorMessage{Type: "error", Message: "unknown message type"}) //nolint:errcheck
			}
		}
	})
}
