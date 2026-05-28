import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";

const HomePage = lazy(() => import("../../pages/home/HomePage"));
const GamePage = lazy(() => import("../../pages/game/GamePage"));
const ProfilePage = lazy(() => import("../../pages/profile/ProfilePage"));

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/game", element: <GamePage /> },
  { path: "/profile", element: <ProfilePage /> },
]);

export function AppRouter() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">
          загрузка...
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}
