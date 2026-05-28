import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Globe,
  Users,
  ChevronRight,
  ArrowLeft,
  Plus,
  LogIn,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";

import { useGameStore, type BotDifficulty } from "@/app/store/game.store";
import { useAuthStore } from "@/app/store/auth.store";
import { roomApi } from "@/shared/api/roomApi";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "mode" | "online" | "botDifficulty";

const MODES = [
  { id: "bot", icon: Bot, label: "Против бота", desc: "Одиночная игра" },
  {
    id: "local",
    icon: Users,
    label: "Локальная игра",
    desc: "Два игрока на одном устройстве",
  },
  { id: "online", icon: Globe, label: "Онлайн", desc: "Играй с друзьями" },
] as const;

export function ModePickerDialog({ open, onClose }: Props) {
  const { startBot, startOnline, startLocal, setRoomId, setBotDifficulty } =
    useGameStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("mode");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<BotDifficulty>("medium");

  const reset = () => {
    setStep("mode");
    setJoinCode("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleMode = (id: "bot" | "local" | "online") => {
    if (id === "bot") {
      setStep("botDifficulty");
      return;
    }

    if (id === "local") {
      startLocal();
      handleClose();
      navigate("/game");
      return;
    }

    if (!user) {
      handleClose();
      navigate("/profile");
      return;
    }

    setStep("online");
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { roomId } = await roomApi.createRoom();
      startOnline();
      setRoomId(roomId);
      handleClose();
      navigate("/game");
    } catch {
      setError("Не удалось создать комнату");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    startOnline();
    setRoomId(code);
    handleClose();
    navigate("/game");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-border/60 p-6">
        {/* MODE SELECT */}
        {step === "mode" && (
          <>
            <DialogHeader className="mb-2">
              <DialogTitle className="text-2xl font-semibold">
                Выбери режим
              </DialogTitle>
              <DialogDescription>
                Начни новую игру Connect Four
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleMode(mode.id)}
                    className="group flex items-center gap-4 w-full rounded-2xl border border-border/60 bg-background p-5 text-left transition-all hover:bg-muted/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <Icon size={24} />
                    </div>

                    <div className="flex-1">
                      <p className="text-base font-medium">{mode.label}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mode.desc}
                      </p>
                    </div>

                    <ChevronRight size={18} className="text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* BOT DIFFICULTY */}
        {step === "botDifficulty" && (
          <>
            <DialogHeader className="mb-2">
              <button
                onClick={() => setStep("mode")}
                className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground"
              >
                <ArrowLeft size={14} /> Назад
              </button>

              <DialogTitle className="text-2xl font-semibold">
                Сложность бота
              </DialogTitle>
              <DialogDescription>Выбери уровень противника</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {[
                { id: "easy", label: "Лёгкий" },
                { id: "medium", label: "Средний" },
                { id: "hard", label: "Сложный" },
                { id: "impossible", label: "Невозможный" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDifficulty(d.id as BotDifficulty)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    selectedDifficulty === d.id
                      ? "border-foreground bg-muted"
                      : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <p className="font-medium">{d.label}</p>
                </button>
              ))}

              <button
                onClick={() => {
                  setBotDifficulty(selectedDifficulty);
                  startBot(1);
                  handleClose();
                  navigate("/game");
                }}
                className="w-full rounded-2xl bg-foreground text-background py-3 font-medium hover:opacity-90"
              >
                Начать игру
              </button>
            </div>
          </>
        )}

        {/* ONLINE */}
        {step === "online" && (
          <>
            <DialogHeader className="mb-2">
              <button
                onClick={() => setStep("mode")}
                className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground"
              >
                <ArrowLeft size={14} /> Назад
              </button>

              <DialogTitle className="text-2xl font-semibold">
                Онлайн игра
              </DialogTitle>
              <DialogDescription>
                Создай комнату или войди по коду
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <button
                onClick={handleCreate}
                disabled={loading}
                className="group flex items-center gap-4 w-full rounded-2xl border p-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Plus size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Создать комнату</p>
                  <p className="text-sm text-muted-foreground">
                    Получишь код — отправь другу
                  </p>
                </div>
                <ChevronRight size={18} />
              </button>

              <div className="rounded-2xl border p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <LogIn size={24} />
                  </div>

                  <div>
                    <p className="font-medium">Войти по коду</p>
                    <p className="text-sm text-muted-foreground">
                      Введи код от друга
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    maxLength={6}
                    className="flex-1 rounded-xl border px-4 py-2 font-mono tracking-widest uppercase"
                  />

                  <button
                    onClick={handleJoin}
                    disabled={joinCode.trim().length < 6}
                    className="rounded-xl bg-foreground text-background px-4 py-2 disabled:opacity-40"
                  >
                    Войти
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
