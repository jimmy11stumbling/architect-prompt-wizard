
import React from "react";
import SavedPrompts from "@/components/SavedPrompts";
import { RequireAuth } from "@/components/auth/AuthWrapper";

const SavedPromptsPage: React.FC = () => {
  return (
    <RequireAuth>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-gradient">Saved Prompts Library</span>
          </h1>
          <p className="text-muted-foreground">
            Browse, manage, and reuse your generated prompts stored securely in the cloud
          </p>
        </div>
        <SavedPrompts />
      </div>
    </RequireAuth>
  );
};

export default SavedPromptsPage;
