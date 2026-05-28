interface Props {
  open: boolean;
  winner: 0 | 1 | 2 | null;
  yourPlayer: 1 | 2 | null;
  onExit: () => void;
  onRestart?: () => void;
}

export function GameOverModal({
  open,
  winner,
  yourPlayer,
  onExit,
  onRestart,
}: Props) {
  if (!open) return null;

  const { emoji, title, sub } = getResult(winner, yourPlayer);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-10 shadow-lg">
        <div className="text-5xl">{emoji}</div>
        <div className="text-center">
          <p className="text-xl font-semibold">{title}</p>
          {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
        </div>

        <div className="flex gap-3">
          {onRestart && (
            <button
              onClick={onRestart}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Ещё раз
            </button>
          )}
          <button
            onClick={onExit}
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}

function getResult(
  winner: 0 | 1 | 2 | null,
  yourPlayer: 1 | 2 | null,
): { emoji: string; title: string; sub?: string } {
  if (winner === 0) return { emoji: "🤝", title: "Ничья!" };

  if (yourPlayer === null) {
    return {
      emoji: "🏆",
      title: `Победил ${winner === 1 ? "Red" : "Yellow"}!`,
    };
  }

  if (winner === yourPlayer) return { emoji: "🎉", title: "Ты победил!" };

  return { emoji: "😔", title: "Ты проиграл", sub: "В следующий раз повезёт" };
}
