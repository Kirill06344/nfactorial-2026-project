import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { ModePickerDialog } from "../../features/join-room/ui/ModePickerDialog";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { useAuthStore } from "../../app/store/auth.store";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

export default function HomePage() {
  const [modeOpen, setModeOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-sm font-medium tracking-widest text-muted-foreground">
          C4
        </span>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button onClick={() => navigate("/profile")} className="rounded-full">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <BoardPreview />
        <h1 className="text-4xl font-medium tracking-tight mt-4">
          Connect Four
        </h1>
        <p className="text-sm text-muted-foreground">4 в ряд · два игрока</p>
        <Button
          size="lg"
          className="mt-8 px-12"
          onClick={() => setModeOpen(true)}
        >
          Играть
        </Button>
      </main>

      <ModePickerDialog open={modeOpen} onClose={() => setModeOpen(false)} />
    </div>
  );
}

function BoardPreview() {
  const sample = [
    [1, 0, 2, 1, 0, 2, 0],
    [0, 1, 0, 2, 1, 0, 2],
    [2, 0, 1, 1, 0, 1, 0],
  ];
  return (
    <div className="grid grid-cols-7 gap-1 p-3 bg-muted rounded-xl">
      {sample.flat().map((v, i) => (
        <div
          key={i}
          className={`w-5 h-5 rounded-full border ${
            v === 1
              ? "bg-red-400 border-red-400"
              : v === 2
                ? "bg-amber-400 border-amber-400"
                : "bg-background border-border"
          }`}
        />
      ))}
    </div>
  );
}
