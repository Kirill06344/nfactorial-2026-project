import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/ui/button";

import { LoginForm } from "./ui/LoginForm";
import { RegisterForm } from "./ui/RegisterForm";
import { ProfileCard } from "./ui/ProfileCard";

import { useAuthStore } from "@/app/store/auth.store";

export default function ProfilePage() {
  const navigate = useNavigate();

  const { user, signOut } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      {/* TOP BAR */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Главная
        </button>

        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground"
          >
            Выйти
          </Button>
        )}
      </nav>

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {user ? (
            <ProfileCard user={user} onLogout={signOut} />
          ) : isLogin ? (
            <LoginForm
              onSwitch={() => setIsLogin(false)}
              onSuccess={() => navigate("/")}
            />
          ) : (
            <RegisterForm
              onSwitch={() => setIsLogin(true)}
              onSuccess={() => navigate("/")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
