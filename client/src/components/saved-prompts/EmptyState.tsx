
import React from "react";
import { Database, Search } from "lucide-react";

interface EmptyStateProps {
  hasPrompts: boolean;
  isFiltered: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasPrompts, isFiltered }) => {
  if (isFiltered) {
    return (
      <div className="text-center py-8">
        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">
          No prompts match your search criteria.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your search terms or clear the search to see all prompts.
        </p>
      </div>
    );
  }

  if (!hasPrompts) {
    return (
      <div className="text-center py-8">
        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">
          No saved prompts yet.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Generate your first prompt to see it saved here.
        </p>
      </div>
    );
  }

  return null;
};

export default EmptyState;
