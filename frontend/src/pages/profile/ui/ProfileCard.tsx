import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import type { User } from "@supabase/supabase-js";

interface Props {
  user: User;
  onLogout: () => void;
}

export function ProfileCard({ user, onLogout }: Props) {
  return (
    <Card className="border-border/60 shadow-sm rounded-2xl">
      <CardContent className="p-6">
        {/* HEADER */}
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-20 h-20 ring-2 ring-border/40">
            <AvatarFallback className="text-lg font-medium">
              {user.email?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-1">
            <p className="font-medium text-base leading-tight">{user.email}</p>

            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 rounded-full"
            >
              online
            </Badge>
          </div>
        </div>

        {/* DIVIDER */}
        <Separator className="my-6" />

        {/* INFO */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Account ID</span>
            <span className="text-right break-all text-xs">{user.id}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* ACTION */}
        <Button
          variant="outline"
          className="w-full mt-6 hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={onLogout}
        >
          Выйти
        </Button>
      </CardContent>
    </Card>
  );
}
