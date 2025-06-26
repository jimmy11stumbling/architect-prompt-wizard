
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface AuthHeaderProps {
  user: User;
  onSignOut: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ user, onSignOut }) => {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-4">
        <h1 className="text-xl font-bold">Intelligent Prompt Architect</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user.email}
          </span>
          <Button variant="outline" size="sm" onClick={onSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
