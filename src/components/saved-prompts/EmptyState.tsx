
import React from "react";
import { Database } from "lucide-react";

interface EmptyStateProps {
  hasPrompts: boolean;
  isFiltered: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasPrompts, isFiltered }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Database className="h-10 w-10 text-ipa-muted mb-4 opacity-50" />
      <h3 className="text-lg font-medium">No saved prompts found</h3>
      <p className="text-sm text-muted-foreground">
        {!hasPrompts
          ? "Generate your first prompt to automatically save it here"
          : "No prompts match your search criteria"}
      </p>
    </div>
  );
};

export default EmptyState;
