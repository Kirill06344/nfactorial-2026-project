export const ENV = {
  API_URL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",

  WS_URL: import.meta.env.VITE_WS_URL ?? "ws://localhost:8080",

  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ?? "",

  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
} as const;
