package middleware

import (
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gofiber/fiber/v2"
)

type claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

// AuthRequired validates a Supabase HS256 JWT from the Authorization header.
// On success it sets fiber locals: "user_id" (string) and "user_email" (string).
func AuthRequired(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing token"})
		}
		userID, email, ok := parseToken(strings.TrimPrefix(header, "Bearer "), jwtSecret)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token"})
		}
		c.Locals("user_id", userID)
		c.Locals("user_email", email)
		return c.Next()
	}
}

// ParseWsToken validates a JWT from a WebSocket query param.
// Returns (userID, email, ok).
func ParseWsToken(token, jwtSecret string) (userID, email string, ok bool) {
	return parseToken(token, jwtSecret)
}

func parseToken(tokenStr, secret string) (userID, email string, ok bool) {
	if tokenStr == "" || secret == "" {
		return "", "", false
	}
	cl := &claims{}
	_, err := jwt.ParseWithClaims(tokenStr, cl, func(t *jwt.Token) (interface{}, error) {
		if _, isHMAC := t.Method.(*jwt.SigningMethodHMAC); !isHMAC {
			return nil, fiber.ErrUnauthorized
		}
		return []byte(secret), nil
	})
	if err != nil {
		return "", "", false
	}
	sub, err := cl.GetSubject()
	if err != nil || sub == "" {
		return "", "", false
	}
	return sub, cl.Email, true
}
