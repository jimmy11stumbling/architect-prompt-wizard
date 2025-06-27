
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PromptSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const PromptSearch: React.FC<PromptSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search prompts by content, project name, or tags..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default PromptSearch;
