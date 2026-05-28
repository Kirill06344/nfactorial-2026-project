const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const roomApi = {
  createRoom: async (): Promise<{ roomId: string }> => {
    const res = await fetch(`${BASE}/api/rooms`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to create room");
    return res.json();
  },
};
