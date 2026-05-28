import { useState } from "react";

import { Button } from "@/shared/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { Input } from "@/shared/ui/input";

import { useAuthStore } from "@/app/store/auth.store";

interface Props {
  onSwitch: () => void;
  onSuccess: () => void;
}

export function LoginForm({ onSwitch, onSuccess }: Props) {
  const { signIn, loading } = useAuthStore();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signIn(email, password);

      onSuccess();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Login error");
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Вход</CardTitle>

        <CardDescription>Войди в аккаунт чтобы играть онлайн</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>

            <Input
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Пароль</label>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Загрузка..." : "Войти"}
          </Button>

          <button
            type="button"
            onClick={onSwitch}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Нет аккаунта? Регистрация
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
