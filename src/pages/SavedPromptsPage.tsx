
import React from "react";
import SavedPrompts from "@/components/SavedPrompts";

const SavedPromptsPage: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Saved Prompts Library</span>
        </h1>
        <p className="text-muted-foreground">
          Browse, manage, and reuse your generated prompts
        </p>
      </div>
      <SavedPrompts />
    </div>
  );
};

export default SavedPromptsPage;
