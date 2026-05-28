package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	SupabaseURL     string
	SupabaseAnonKey string
	JWTSecret       string
	Environment     string
}

func Load() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		Port:            getEnv("PORT", "8080"),
		SupabaseURL:     getEnv("SUPABASE_URL", ""),
		SupabaseAnonKey: getEnv("SUPABASE_ANON_KEY", ""),
		JWTSecret:       getEnv("JWT_SECRET", "super-secret-change-me"),
		Environment:     getEnv("ENV", "development"),
	}

	if cfg.SupabaseURL == "" || cfg.SupabaseAnonKey == "" {
		log.Println("WARNING: SUPABASE_URL or SUPABASE_ANON_KEY not set — auth features disabled")
	}

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
